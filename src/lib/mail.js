import { after } from "next/server";
import { createId, query } from "@/lib/db";
import { WAITING_FOR_PROVIDER, deliverQueued } from "@/lib/campaigns/outbox";
import { postmarkConfigured } from "@/lib/email/postmark";
import { ApiError } from "@/lib/api";
import { assertCanWrite } from "@/lib/permissions";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
// Status shown in the lists, from the outbox row Postmark updates:
// draft | waiting (Postmark not connected yet) | sending | sent | delivered | opened | bounced | failed
const STATUS_SQL = `CASE
  WHEN mail_messages.status = 'draft' THEN 'draft'
  WHEN deliveries.id IS NULL THEN 'waiting'
  WHEN deliveries.bounced_at IS NOT NULL OR deliveries.complained_at IS NOT NULL THEN 'bounced'
  WHEN deliveries.opened_at IS NOT NULL THEN 'opened'
  WHEN deliveries.delivered_at IS NOT NULL THEN 'delivered'
  WHEN deliveries.status = 'sent' THEN 'sent'
  WHEN deliveries.status IN ('failed', 'skipped') THEN 'failed'
  WHEN ? THEN 'sending'
  ELSE 'waiting' END`;
const columns = `mail_messages.id, mail_messages.to_email AS toEmail, mail_messages.cc, mail_messages.bcc, mail_messages.subject, mail_messages.body,
  ${STATUS_SQL} AS status, mail_messages.track_opens AS trackOpens, mail_messages.created_at AS createdAt, mail_messages.updated_at AS updatedAt,
  deliveries.sent_at AS sentAt, deliveries.delivered_at AS deliveredAt, deliveries.opened_at AS openedAt, deliveries.bounced_at AS bouncedAt,
  COALESCE(deliveries.provider_status, deliveries.status_reason) AS deliveryNote,
  mail_messages.user_id AS senderId, users.name AS senderName, users.email AS senderEmail`;
const FROM = "FROM mail_messages JOIN users ON users.id = mail_messages.user_id LEFT JOIN email_deliveries AS deliveries ON deliveries.id = mail_messages.delivery_id";

// "a@b.com, c@d.com" → normalized list, or null when empty
function emailList(value, label) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new ApiError(`${label} must be text.`);
  const list = value.split(/[,;\s]+/).filter(Boolean);
  if (list.length > 20) throw new ApiError(`${label} can have up to 20 addresses.`);
  const invalid = list.find((address) => !EMAIL.test(address));
  if (invalid) throw new ApiError(`${label}: "${invalid}" isn't a valid email address.`);
  return list.join(", ");
}

// Customers share their company's sent mail; each PitchProX staff member sees only their own.
// Drafts are only ever seen by the person writing them.
const scopeFor = (user) =>
  CUSTOMER_ROLES.includes(user.role)
    ? { sql: "mail_messages.organization_id = ? AND (mail_messages.status <> 'draft' OR mail_messages.user_id = ?)", values: [user.organizationId, user.id] }
    : { sql: "mail_messages.organization_id = ? AND mail_messages.user_id = ?", values: [user.organizationId, user.id] };

export async function listMail(user) {
  const scope = scopeFor(user);
  return query(`SELECT ${columns} ${FROM} WHERE ${scope.sql} ORDER BY COALESCE(mail_messages.updated_at, mail_messages.created_at) DESC LIMIT 500`, [postmarkConfigured(), ...scope.values]);
}

export async function getMail(user, id) {
  const scope = scopeFor(user);
  const [row] = await query(`SELECT ${columns} ${FROM} WHERE mail_messages.id = ? AND ${scope.sql}`, [postmarkConfigured(), id, ...scope.values]);
  if (!row) throw new ApiError("Email not found.", 404);
  return row;
}

// Fields of an email being written. A draft may be incomplete; a send needs To, Subject and a message.
function fieldsFrom(body, { draft }) {
  const to = typeof body.to === "string" ? body.to.trim() : "";
  if (!draft && !EMAIL.test(to)) throw new ApiError("Enter a valid recipient email address.");
  if (draft && to && !EMAIL.test(to)) throw new ApiError("Enter a valid recipient email address, or leave it empty for now.");
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  if (!draft && !subject) throw new ApiError("Add a subject.");
  if (subject.length > 255) throw new ApiError("Subject must be 255 characters or fewer.");
  const message = typeof body.body === "string" ? body.body.trim() : "";
  if (!draft && !message) throw new ApiError("Write a message.");
  if (message.length > 20000) throw new ApiError("Message must be 20,000 characters or fewer.");
  if (draft && !to && !subject && !message) throw new ApiError("There's nothing to save yet.");
  return { to, cc: emailList(body.cc, "CC"), bcc: emailList(body.bcc, "BCC"), subject, body: message, trackOpens: body.trackOpens === false ? 0 : 1 };
}

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
// Plain text as written → simple HTML (paragraphs and line breaks; nothing added)
const toHtml = (text) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f2937">${text
    .split(/\n{2,}/)
    .map((paragraph) => `<p style="margin:0 0 14px">${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("")}</div>`;

// Merge fields from the compose form's "Merge fields" menu and the email templates. They're filled
// from the prospect or lead with the recipient's address; a field we can't fill stops the send, so a
// literal "{First Name}" never reaches anyone.
const MERGE_FIELDS = ["First Name", "Last Name", "Company", "Phone", "Property Address"];
async function fillMergeFields(user, fields) {
  const used = MERGE_FIELDS.filter((key) => `${fields.subject}\n${fields.body}`.includes(`{${key}}`));
  if (!used.length) return fields;
  const internal = !CUSTOMER_ROLES.includes(user.role);
  const own = user.role === "sales_rep" ? " AND assigned_to = ?" : "";
  const values = [user.organizationId, fields.to.toLowerCase(), ...(own ? [user.id] : [])];
  const [contact] = [
    ...(await query(`SELECT name, phone_number AS phone, property_address AS address FROM prospects WHERE organization_id = ? AND LOWER(email) = ?${own} ORDER BY updated_at DESC LIMIT 1`, values)),
    ...(await query(`SELECT name, phone_number AS phone, property_address AS address FROM leads WHERE organization_id = ? AND LOWER(email) = ?${own} ORDER BY updated_at DESC LIMIT 1`, values)),
  ];
  const [first, ...rest] = (contact?.name ?? "").trim().split(/\s+/);
  const known = {
    "First Name": first || null,
    "Last Name": rest.join(" ") || null,
    // Internal pipelines keep the company name where customers keep the property address
    Company: internal ? contact?.address ?? null : null,
    Phone: contact?.phone ?? null,
    "Property Address": internal ? null : contact?.address ?? null,
  };
  const missing = used.filter((key) => !known[key]);
  if (missing.length) {
    throw new ApiError(`${missing.map((key) => `{${key}}`).join(", ")} can't be filled in for ${fields.to}${contact ? "" : " (no prospect or lead has this email)"}. Type the details in, or remove the merge field.`);
  }
  const fill = (text) => used.reduce((result, key) => result.replaceAll(`{${key}}`, known[key]), text);
  return { ...fields, subject: fill(fields.subject), body: fill(fields.body) };
}

// Hand the email to the outbox (Postmark, Transactional stream): from "Name via PitchProX",
// replies go to the sender's own address. Delivered right after the response.
async function deliver(user, id, written) {
  const fields = await fillMergeFields(user, written);
  for (const address of [fields.to, ...(fields.cc ?? "").split(", "), ...(fields.bcc ?? "").split(", ")].filter(Boolean)) {
    const [blocked] = await query("SELECT reason FROM email_suppressions WHERE email = ? AND reason IN ('bounced', 'spam')", [address.toLowerCase()]);
    if (blocked) throw new ApiError(`Emails to ${address} ${blocked.reason === "spam" ? "were marked as spam" : "bounced"} before, so this one can't be sent.`, 409);
  }
  const deliveryId = createId("mail");
  await query(
    "INSERT INTO email_deliveries (id, source, source_id, template_id, user_id, to_email, subject, html, status, status_reason, stream, from_name, reply_to, cc, bcc, track_opens) VALUES (?, 'mail', ?, NULL, NULL, ?, ?, ?, 'queued', ?, 'transactional', ?, ?, ?, ?, ?)",
    [deliveryId, id, fields.to, fields.subject.slice(0, 255), toHtml(fields.body), WAITING_FOR_PROVIDER, `${user.name} via PitchProX`.slice(0, 160), user.email, fields.cc, fields.bcc, fields.trackOpens]
  );
  // The record keeps what was actually sent (merge fields filled in)
  await query("UPDATE mail_messages SET status = 'queued', delivery_id = ?, subject = ?, body = ?, created_at = NOW(), updated_at = NULL WHERE id = ?", [deliveryId, fields.subject.slice(0, 255), fields.body, id]);
  after(async () => {
    try {
      await deliverQueued({ ids: [deliveryId] });
    } catch (error) {
      console.error("Mail delivery failed", error);
    }
  });
}

// POST: send now, or save as a draft ({ draft: true })
export async function queueMail(user, body) {
  assertCanWrite(user);
  const draft = body.draft === true;
  const fields = fieldsFrom(body, { draft });
  const id = createId("mail");
  // Stored as a draft first; sending turns it into a sent email. If sending is refused (a merge field
  // we can't fill, an address that bounced) nothing is left behind.
  await query("INSERT INTO mail_messages (id, organization_id, user_id, to_email, cc, bcc, subject, body, track_opens, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())", [
    id, user.organizationId, user.id, fields.to, fields.cc, fields.bcc, fields.subject, fields.body, fields.trackOpens,
  ]);
  if (!draft) {
    try {
      await deliver(user, id, fields);
    } catch (error) {
      await query("DELETE FROM mail_messages WHERE id = ? AND status = 'draft'", [id]);
      throw error;
    }
  }
  return getMail(user, id);
}

async function ownDraft(user, id) {
  const [row] = await query("SELECT id, status, user_id AS userId FROM mail_messages WHERE id = ? AND organization_id = ?", [id, user.organizationId]);
  if (!row || row.userId !== user.id) throw new ApiError("Email not found.", 404);
  if (row.status !== "draft") throw new ApiError("This email was already sent, so it can't be changed.", 409);
  return row;
}

// PATCH a draft: save the changes, or send it ({ send: true })
export async function updateDraft(user, id, body) {
  assertCanWrite(user);
  await ownDraft(user, id);
  const send = body.send === true;
  const fields = fieldsFrom(body, { draft: !send });
  await query("UPDATE mail_messages SET to_email = ?, cc = ?, bcc = ?, subject = ?, body = ?, track_opens = ?, updated_at = NOW() WHERE id = ? AND status = 'draft'", [
    fields.to, fields.cc, fields.bcc, fields.subject, fields.body, fields.trackOpens, id,
  ]);
  if (send) await deliver(user, id, fields);
  return getMail(user, id);
}

export async function deleteDraft(user, id) {
  assertCanWrite(user);
  await ownDraft(user, id);
  await query("DELETE FROM mail_messages WHERE id = ? AND status = 'draft'", [id]);
  return { deleted: true };
}

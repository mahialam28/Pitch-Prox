import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { assertCanWrite } from "@/lib/permissions";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const columns = "mail_messages.id, mail_messages.to_email AS toEmail, mail_messages.cc, mail_messages.bcc, mail_messages.subject, mail_messages.body, mail_messages.status, mail_messages.track_opens AS trackOpens, mail_messages.created_at AS createdAt, users.name AS senderName, users.email AS senderEmail";

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

// Customers share their company's sent mail; each PitchProX staff member sees only their own
const scopeFor = (user) =>
  CUSTOMER_ROLES.includes(user.role)
    ? { sql: "mail_messages.organization_id = ?", values: [user.organizationId] }
    : { sql: "mail_messages.organization_id = ? AND mail_messages.user_id = ?", values: [user.organizationId, user.id] };

export async function listMail(user) {
  const scope = scopeFor(user);
  return query(`SELECT ${columns} FROM mail_messages JOIN users ON users.id = mail_messages.user_id WHERE ${scope.sql} ORDER BY mail_messages.created_at DESC LIMIT 500`, scope.values);
}

export async function getMail(user, id) {
  const scope = scopeFor(user);
  const [row] = await query(`SELECT ${columns} FROM mail_messages JOIN users ON users.id = mail_messages.user_id WHERE mail_messages.id = ? AND ${scope.sql}`, [id, ...scope.values]);
  if (!row) throw new ApiError("Email not found.", 404);
  return row;
}

// Saved as "queued": no email service is connected yet, so nothing is delivered
export async function queueMail(user, body) {
  assertCanWrite(user);
  const to = typeof body.to === "string" ? body.to.trim() : "";
  if (!EMAIL.test(to)) throw new ApiError("Enter a valid recipient email address.");
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  if (!subject) throw new ApiError("Add a subject.");
  if (subject.length > 255) throw new ApiError("Subject must be 255 characters or fewer.");
  const message = typeof body.body === "string" ? body.body.trim() : "";
  if (!message) throw new ApiError("Write a message.");
  if (message.length > 20000) throw new ApiError("Message must be 20,000 characters or fewer.");
  const id = createId("mail");
  await query("INSERT INTO mail_messages (id, organization_id, user_id, to_email, cc, bcc, subject, body, track_opens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, user.organizationId, user.id, to, emailList(body.cc, "CC"), emailList(body.bcc, "BCC"), subject, message, body.trackOpens === false ? 0 : 1]);
  return getMail(user, id);
}

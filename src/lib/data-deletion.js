import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { sendSystemEmail, systemLayout } from "@/lib/email/system";
import { notify, superAdmins } from "@/lib/notifications";
import { ROLES, canAccessSection } from "@/utils.js/roles";

// ── Data deletion requests (Phase 15) ──
// Anyone can ask from /data-deletion (Facebook and Google require such a page). The person gets a
// confirmation with a DEL-#### reference; Super Admins are told; staff with the Compliance section
// work it to Done or Rejected (with a note), and the person is emailed when it's finished.
// Deleting the data itself is done by staff (e.g. Users → account → Delete), then the request is closed.

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
export const DELETION_SCOPES = { account: "My whole account and its data", calls: "Call recordings and transcripts", contact: "My contact details (I'm not a customer)", other: "Something else (explain below)" };
const STATUSES = ["open", "in_progress", "done", "rejected"];
const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) || null : null);
const reference = (row) => `DEL-${row.number}`;

const present = (row) => ({
  id: row.id,
  reference: reference(row),
  name: row.name,
  email: row.email,
  scope: row.scope,
  scopeLabel: DELETION_SCOPES[row.scope] ?? row.scope,
  details: row.details,
  isCustomer: Boolean(row.user_id),
  status: row.status,
  handledBy: row.handledByName ?? null,
  note: row.handled_note,
  createdAt: row.created_at,
  completedAt: row.completed_at,
});

export async function createDeletionRequest(body, { ip = null, user = null } = {}) {
  const name = clean(body.name, 255);
  const email = clean(user?.email ?? body.email, 255)?.toLowerCase();
  if (!name) throw new ApiError("Enter your name.");
  if (!email || !EMAIL.test(email)) throw new ApiError("Enter the email address your account or data is under.");
  const scope = DELETION_SCOPES[body.scope] ? body.scope : null;
  if (!scope) throw new ApiError("Choose what you'd like deleted.");
  const details = clean(body.details, 3000);
  if (scope === "other" && !details) throw new ApiError("Tell us what you'd like deleted.");
  const [account] = await query("SELECT id FROM users WHERE email = ?", [email]);
  const id = createId("deletion");
  await query("INSERT INTO data_deletion_requests (id, name, email, scope, details, user_id, ip) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, name, email, scope, details, account?.id ?? null, ip]);
  const [row] = await query("SELECT * FROM data_deletion_requests WHERE id = ?", [id]);

  await sendSystemEmail({
    kind: "data_deletion",
    userId: account?.id ?? null,
    email,
    subject: `We received your data deletion request (${reference(row)})`,
    html: systemLayout({
      heading: "We received your request",
      paragraphs: [
        `Hi ${name.split(" ")[0]}, we received your request to delete: ${DELETION_SCOPES[scope].toLowerCase()}. Your reference is ${reference(row)}.`,
        "We'll confirm by email when it's done, normally within 30 days. If we need to check that the request is really from you, we'll reply to this address.",
      ],
      footnote: "If you didn't ask for this, reply to this email so we can stop it.",
    }),
  });
  await notify(await superAdmins(), {
    type: "privacy",
    title: `Data deletion request ${reference(row)}`,
    body: `${name} (${email}): ${DELETION_SCOPES[scope]}`,
    link: "/super-admin/compliance-audit/data-deletion",
    entityType: "data_deletion",
    entityId: id,
  });
  return { reference: reference(row) };
}

export async function requireDeletionReader(user) {
  if (!canAccessSection(user.role, "compliance")) throw new Error("FORBIDDEN");
}

export async function listDeletionRequests(user, { status } = {}) {
  await requireDeletionReader(user);
  const clauses = [];
  const values = [];
  if (status) {
    if (!STATUSES.includes(status)) throw new ApiError("Unknown status.");
    clauses.push("data_deletion_requests.status = ?");
    values.push(status);
  }
  const rows = await query(
    `SELECT data_deletion_requests.*, handlers.name AS handledByName FROM data_deletion_requests LEFT JOIN users AS handlers ON handlers.id = data_deletion_requests.handled_by
     ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""} ORDER BY data_deletion_requests.status IN ('done', 'rejected'), data_deletion_requests.created_at DESC LIMIT 500`,
    values
  );
  const [counts] = await query("SELECT SUM(status = 'open') AS open, SUM(status = 'in_progress') AS inProgress, SUM(status = 'done') AS done, SUM(status = 'rejected') AS rejected FROM data_deletion_requests");
  return { results: rows.map(present), counts: Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, Number(value ?? 0)])) };
}

// { status: in_progress | done | rejected, note } — Done / Rejected email the person
export async function updateDeletionRequest(user, id, body) {
  await requireDeletionReader(user);
  if (user.role === ROLES.AUDITOR) throw new Error("FORBIDDEN");
  const [row] = await query("SELECT * FROM data_deletion_requests WHERE id = ?", [id]);
  if (!row) throw new ApiError("Request not found.", 404);
  if (!["in_progress", "done", "rejected"].includes(body.status)) throw new ApiError("Choose In progress, Done or Rejected.");
  if (["done", "rejected"].includes(row.status)) throw new ApiError("This request is already closed.", 409);
  const note = clean(body.note, 1000);
  if (body.status === "rejected" && !note) throw new ApiError("Say why it's rejected; the person is told.");
  await query("UPDATE data_deletion_requests SET status = ?, handled_by = ?, handled_note = COALESCE(?, handled_note), updated_at = NOW(), completed_at = IF(? IN ('done', 'rejected'), NOW(), NULL) WHERE id = ?", [
    body.status, user.id, note, body.status, id,
  ]);
  await recordAudit(user, { action: `privacy.deletion_${body.status}`, entityType: "data_deletion", entityId: id, summary: `${reference(row)} (${row.email}) marked ${body.status.replace("_", " ")}${note ? `: ${note}` : ""}` });
  if (body.status === "done" || body.status === "rejected") {
    await sendSystemEmail({
      kind: "data_deletion",
      userId: row.user_id,
      email: row.email,
      subject: body.status === "done" ? `Your data has been deleted (${reference(row)})` : `About your data deletion request (${reference(row)})`,
      html: systemLayout({
        heading: body.status === "done" ? "Your request is complete" : "We couldn't complete your request",
        paragraphs: [
          body.status === "done" ? `Hi ${row.name.split(" ")[0]}, we've deleted: ${DELETION_SCOPES[row.scope].toLowerCase()} (${reference(row)}).` : `Hi ${row.name.split(" ")[0]}, about ${reference(row)}:`,
          ...(note ? [note] : []),
        ],
        footnote: "Reply to this email if you have any questions.",
      }),
    });
  }
  const [updated] = await query("SELECT data_deletion_requests.*, handlers.name AS handledByName FROM data_deletion_requests LEFT JOIN users AS handlers ON handlers.id = data_deletion_requests.handled_by WHERE data_deletion_requests.id = ?", [id]);
  return present(updated);
}

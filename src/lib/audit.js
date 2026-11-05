import { createId, query } from "@/lib/db";
import { requestClient } from "@/lib/auth";

// ── Audit log ──
// Call recordAudit() after any change worth answering "who did this, and when?"
// for: staff and access changes, onboarding signatures, account actions, billing
// adjustments, compliance records. Entries are never edited or deleted.
//
//   await recordAudit(user, { action: "staff.invited", entityType: "user", entityId: id, summary: "Invited Jane Doe as Sales Rep" });
export async function recordAudit(actor, { action, entityType = null, entityId = null, summary, metadata = null, organizationId = null }) {
  let client = { ip: null, userAgent: null };
  try { client = await requestClient(); } catch { /* not inside a request (scripts) */ }
  await query(
    "INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, organization_id, action, entity_type, entity_id, summary, metadata, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      createId("audit"),
      actor?.id ?? null,
      actor?.name ?? "System",
      actor?.role ?? "system",
      organizationId ?? actor?.organizationId ?? null,
      action,
      entityType,
      entityId,
      String(summary).slice(0, 500),
      metadata ? JSON.stringify(metadata) : null,
      client.ip,
      client.userAgent,
    ]
  );
}

// Latest entries, optionally for one record (e.g. an employee's access changes)
export async function listAuditLogs({ entityType, entityId, actions, limit = 50 } = {}) {
  const clauses = [];
  const values = [];
  if (entityType) { clauses.push("entity_type = ?"); values.push(entityType); }
  if (entityId) { clauses.push("entity_id = ?"); values.push(entityId); }
  if (actions?.length) { clauses.push(`action IN (${actions.map(() => "?").join(", ")})`); values.push(...actions); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  return query(
    `SELECT id, actor_id AS actorId, actor_name AS actorName, actor_role AS actorRole, action, entity_type AS entityType, entity_id AS entityId, summary, created_at AS createdAt FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ${safeLimit}`,
    values
  );
}

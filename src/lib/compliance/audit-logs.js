import { query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { likePattern, paged } from "@/lib/listing";
import { ROLE_LABELS } from "@/utils.js/roles";
import { AUDIT_CATEGORIES, CATEGORY_RULES, DEFAULT_CATEGORY, actionLabel, categoryLabel, entityLabel } from "@/lib/compliance/audit-catalog";

// ── Audit Logs page (Compliance & Audit) ──
// Reads the audit_logs table that every module writes to (lib/audit.js). Entries
// are never edited or deleted; this module only lists, counts and exports them.

const DAY = 86400000;

// SQL that files a row under its category (same rules as categoryOf in the catalog).
// The values are constants from the catalog, checked here before they're placed in SQL.
const SAFE = /^[a-z_.-]+$/;
const literal = (value) => {
  if (!SAFE.test(value)) throw new Error(`Unsafe audit catalog value: ${value}`);
  return `'${value}'`;
};
const CATEGORY_SQL = `(CASE ${[
  ...Object.entries(CATEGORY_RULES.overrides).map(([action, category]) => `WHEN action = ${literal(action)} THEN ${literal(category)}`),
  ...Object.entries(CATEGORY_RULES.areas).map(([area, category]) => `WHEN SUBSTRING_INDEX(action, '.', 1) = ${literal(area)} THEN ${literal(category)}`),
].join(" ")} ELSE ${literal(DEFAULT_CATEGORY)} END)`;

const roleLabel = (role) => ROLE_LABELS[role] ?? (role === "system" ? "System" : role === "unknown" ? "Unknown account" : role ?? "—");

const toEvent = (row) => ({
  id: row.id,
  createdAt: row.createdAt,
  user: { id: row.actorId, name: row.actorName ?? "System", role: roleLabel(row.actorRole) },
  action: actionLabel(row.action),
  actionKey: row.action,
  entity: entityLabel(row.entityType),
  entityType: row.entityType,
  entityId: row.entityId ?? "—",
  ipAddress: row.ip ?? "—",
  details: row.summary,
  categoryKey: row.category,
  category: categoryLabel(row.category),
});

const dateOnly = (value) => (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null);

// Filters from the query string → WHERE clause. Every value is a bound parameter.
export function auditFilters(searchParams) {
  const get = (key) => (searchParams.get(key) ?? "").trim();
  const category = get("category");
  if (category && category !== "all" && !AUDIT_CATEGORIES.some((item) => item.id === category)) throw new ApiError("Unknown category.");
  const from = get("from");
  const to = get("to");
  if ((from && !dateOnly(from)) || (to && !dateOnly(to))) throw new ApiError("Dates must look like 2026-11-08.");
  return {
    category: category === "all" ? "" : category,
    action: get("action").slice(0, 80),
    entity: get("entity").slice(0, 40),
    user: get("user").slice(0, 255),
    ip: get("ip").slice(0, 64),
    search: get("search").slice(0, 120),
    from,
    to,
  };
}

function whereClause(filters) {
  const clauses = [];
  const values = [];
  if (filters.category) { clauses.push(`${CATEGORY_SQL} = ?`); values.push(filters.category); }
  if (filters.action) { clauses.push("action = ?"); values.push(filters.action); }
  if (filters.entity) { clauses.push("entity_type = ?"); values.push(filters.entity); }
  if (filters.user) { clauses.push("actor_name = ?"); values.push(filters.user); }
  if (filters.ip) { clauses.push("ip LIKE ?"); values.push(likePattern(filters.ip)); }
  if (filters.from) { clauses.push("created_at >= ?"); values.push(`${filters.from} 00:00:00`); }
  if (filters.to) { clauses.push("created_at < DATE_ADD(?, INTERVAL 1 DAY)"); values.push(filters.to); }
  if (filters.search) {
    const pattern = likePattern(filters.search);
    clauses.push("(action LIKE ? OR summary LIKE ? OR actor_name LIKE ? OR entity_id LIKE ? OR ip LIKE ?)");
    values.push(pattern, pattern, pattern, pattern, pattern);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", values };
}

const SELECT = `SELECT id, actor_id AS actorId, actor_name AS actorName, actor_role AS actorRole, action, entity_type AS entityType, entity_id AS entityId, summary, ip, created_at AS createdAt, ${CATEGORY_SQL} AS category FROM audit_logs`;

// One page of events, newest first
export async function listAuditEvents(filters, { page = 1, pageSize = 10 } = {}) {
  const size = Math.min(100, Math.max(1, Number(pageSize) || 10));
  const current = Math.max(1, Number(page) || 1);
  const { where, values } = whereClause(filters);
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM audit_logs ${where}`, values);
  const rows = await query(`${SELECT} ${where} ORDER BY created_at DESC, id DESC LIMIT ${size} OFFSET ${(current - 1) * size}`, values);
  return paged(rows.map(toEvent), Number(total), { page: current, pageSize: size });
}

// KPI cards: all-time count per category, and the last 7 days against the 7 before
// (a % change only once the earlier week has at least 5 events, so it means something)
export async function auditStats() {
  const now = Date.now();
  const rows = await query(
    `SELECT ${CATEGORY_SQL} AS category, COUNT(*) AS total, SUM(created_at >= ?) AS recent, SUM(created_at >= ? AND created_at < ?) AS previous FROM audit_logs GROUP BY category`,
    [new Date(now - 7 * DAY), new Date(now - 14 * DAY), new Date(now - 7 * DAY)]
  );
  const card = (id, items) => {
    const total = items.reduce((sum, row) => sum + Number(row.total), 0);
    const recent = items.reduce((sum, row) => sum + Number(row.recent ?? 0), 0);
    const previous = items.reduce((sum, row) => sum + Number(row.previous ?? 0), 0);
    return { id, total, last7Days: recent, previous7Days: previous, changePct: previous >= 5 ? Math.round(((recent - previous) / previous) * 100) : null };
  };
  return {
    total: card("total", rows),
    categories: AUDIT_CATEGORIES.map((category) => ({ ...card(category.id, rows.filter((row) => row.category === category.id)), label: category.label })),
  };
}

// Choices for the filter lists: only values that actually occur in the log
export async function auditFilterOptions() {
  const [actions, entities, users, ips] = await Promise.all([
    query("SELECT DISTINCT action FROM audit_logs ORDER BY action LIMIT 300"),
    query("SELECT DISTINCT entity_type AS entityType FROM audit_logs WHERE entity_type IS NOT NULL ORDER BY entity_type LIMIT 100"),
    query("SELECT DISTINCT actor_name AS name FROM audit_logs WHERE actor_name IS NOT NULL ORDER BY actor_name LIMIT 300"),
    query("SELECT ip, MAX(created_at) AS lastSeen FROM audit_logs WHERE ip IS NOT NULL GROUP BY ip ORDER BY lastSeen DESC LIMIT 50"),
  ]);
  return {
    actions: actions.map((row) => ({ value: row.action, label: actionLabel(row.action) })).sort((a, b) => a.label.localeCompare(b.label)),
    entities: entities.map((row) => ({ value: row.entityType, label: entityLabel(row.entityType) })).sort((a, b) => a.label.localeCompare(b.label)),
    users: users.map((row) => row.name),
    ips: ips.map((row) => row.ip),
  };
}

// ── Export ──
export const EXPORT_RANGES = { filters: null, "7d": 7, "30d": 30, "90d": 90, year: "year" };
const EXPORT_LIMIT = 50000;

// Never exported, whatever the option: secrets and session material (client item 191)
const SECRET_KEY = /pass(word)?|token|secret|cookie|authorization|session|api[_-]?key|private[_-]?key|salt|hash/i;
function scrubSecrets(value) {
  if (Array.isArray(value)) return value.map(scrubSecrets);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => !SECRET_KEY.test(key)).map(([key, item]) => [key, scrubSecrets(item)]));
  return value;
}

const csvCell = (cell) => {
  let text = String(cell ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; // stop spreadsheet formulas
  return `"${text.replace(/"/g, '""')}"`;
};

export async function exportAuditLogs(user, filters, { range = "filters", format = "csv", includeContext = false } = {}) {
  if (!(range in EXPORT_RANGES)) throw new ApiError("Unknown date range.");
  if (!["csv", "json"].includes(format)) throw new ApiError("Format must be CSV or JSON.");
  const scoped = { ...filters };
  if (range !== "filters") {
    const start = range === "year" ? new Date(new Date().getFullYear(), 0, 1) : new Date(Date.now() - EXPORT_RANGES[range] * DAY);
    scoped.from = start.toISOString().slice(0, 10);
    scoped.to = "";
  }
  const { where, values } = whereClause(scoped);
  const rows = await query(
    `SELECT id, actor_id AS actorId, actor_name AS actorName, actor_role AS actorRole, organization_id AS organizationId, action, entity_type AS entityType, entity_id AS entityId, summary, metadata, ip, user_agent AS userAgent, created_at AS createdAt, ${CATEGORY_SQL} AS category FROM audit_logs ${where} ORDER BY created_at DESC, id DESC LIMIT ${EXPORT_LIMIT}`,
    values
  );
  const records = rows.map((row) => {
    const record = {
      time: new Date(row.createdAt).toISOString(),
      user: row.actorName ?? "System",
      role: roleLabel(row.actorRole),
      action: actionLabel(row.action),
      actionKey: row.action,
      category: categoryLabel(row.category),
      entity: entityLabel(row.entityType),
      entityId: row.entityId ?? "",
      ipAddress: row.ip ?? "",
      details: row.summary,
    };
    if (includeContext) {
      const metadata = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata;
      Object.assign(record, { eventId: row.id, userId: row.actorId ?? "", organizationId: row.organizationId ?? "", userAgent: row.userAgent ?? "", metadata: metadata ? scrubSecrets(metadata) : null });
    }
    return record;
  });

  await recordAudit(user, {
    action: "audit.exported",
    entityType: "audit_log",
    summary: `Exported ${records.length} audit log event${records.length === 1 ? "" : "s"} as ${format.toUpperCase()}`,
    metadata: { format, range, includeContext, rows: records.length, filters: Object.fromEntries(Object.entries(scoped).filter(([, value]) => value)) },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "json") return { filename: `audit-logs-${stamp}.json`, type: "application/json", body: JSON.stringify(records, null, 2) };
  const columns = ["time", "user", "role", "action", "actionKey", "category", "entity", "entityId", "ipAddress", "details", ...(includeContext ? ["eventId", "userId", "organizationId", "userAgent", "metadata"] : [])];
  const header = ["Time (UTC)", "User", "Role", "Action", "Action key", "Category", "Entity", "Entity ID", "IP address", "Details", ...(includeContext ? ["Event ID", "User ID", "Organization ID", "User agent", "Metadata"] : [])];
  const lines = records.map((record) => columns.map((column) => csvCell(column === "metadata" ? (record.metadata ? JSON.stringify(record.metadata) : "") : record[column])).join(","));
  return { filename: `audit-logs-${stamp}.csv`, type: "text/csv; charset=utf-8", body: [header.map(csvCell).join(","), ...lines].join("\n") };
}

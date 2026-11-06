import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { ROLES } from "@/utils.js/roles";

// ── Staff announcements (Calendar & Announcements) ──
// Super Admin, Admin Manager and Support post them; every employee sees the ones meant
// for their role. Each person can dismiss one from their own list. Emailing them waits
// for an email service; until then they appear on the Calendar pages.

export const PRIORITIES = ["urgent", "important", "normal", "low"];
// Audience → roles that receive it
export const AUDIENCES = {
  "All Employees": null,
  "All Sales Reps": [ROLES.SALES_REP],
  Managers: [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER],
  "Support Team": [ROLES.SUPPORT],
  "HQ Operations": [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER, ROLES.SUPPORT, ROLES.AUDITOR],
};
const MANAGER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER, ROLES.SUPPORT];
export const canManageAnnouncements = (user) => MANAGER_ROLES.includes(user.role);
const canChange = (user, row) => user.role === ROLES.SUPER_ADMIN || row.authorId === user.id;

const STATUS = `CASE WHEN announcements.archived_at IS NOT NULL OR (announcements.expires_at IS NOT NULL AND announcements.expires_at <= NOW()) THEN 'archived' WHEN announcements.publish_at > NOW() THEN 'scheduled' ELSE 'active' END`;
const COLUMNS = `announcements.id, announcements.title, announcements.body, announcements.priority, announcements.audience,
  announcements.publish_at AS publishAt, announcements.expires_at AS expiresAt, announcements.notify, announcements.author_id AS authorId,
  announcements.author_name AS authorName, announcements.archived_at AS archivedAt, announcements.created_at AS createdAt, ${STATUS} AS status`;

// Audiences that include this role
const audiencesFor = (role) => Object.keys(AUDIENCES).filter((name) => !AUDIENCES[name] || AUDIENCES[name].includes(role));

const toAnnouncement = (row, user) => ({ ...row, notify: Boolean(row.notify), canEdit: canChange(user, row) });

export async function listAnnouncements(user, { tab = "active" } = {}) {
  if (!["active", "scheduled", "archived"].includes(tab)) throw new ApiError("Tab must be active, scheduled or archived.");
  const manager = canManageAnnouncements(user);
  if (tab === "scheduled" && !manager) return { results: [], counts: await counts(user), canManage: false };
  const clauses = [`${STATUS} = ?`];
  const values = [tab];
  // Managers see everything; others only what's meant for them
  if (!manager) {
    const audiences = audiencesFor(user.role);
    clauses.push(`announcements.audience IN (${audiences.map(() => "?").join(", ")})`);
    values.push(...audiences);
  }
  // Active: hide the ones this person dismissed
  if (tab === "active") {
    clauses.push("NOT EXISTS (SELECT 1 FROM announcement_dismissals WHERE announcement_dismissals.announcement_id = announcements.id AND announcement_dismissals.user_id = ?)");
    values.push(user.id);
  }
  const order = tab === "scheduled" ? "announcements.publish_at ASC" : `FIELD(announcements.priority, 'urgent', 'important', 'normal', 'low'), announcements.publish_at DESC`;
  const rows = await query(`SELECT ${COLUMNS} FROM announcements WHERE ${clauses.join(" AND ")} ORDER BY ${tab === "archived" ? "COALESCE(announcements.archived_at, announcements.expires_at) DESC" : order} LIMIT 100`, values);
  return { results: rows.map((row) => toAnnouncement(row, user)), counts: await counts(user), canManage: manager };
}

// Header cards: active (for this person) and scheduled
async function counts(user) {
  const audiences = audiencesFor(user.role);
  const manager = canManageAnnouncements(user);
  const [row] = await query(
    `SELECT SUM(${STATUS} = 'active' AND NOT EXISTS (SELECT 1 FROM announcement_dismissals WHERE announcement_dismissals.announcement_id = announcements.id AND announcement_dismissals.user_id = ?)) AS active,
      SUM(${STATUS} = 'scheduled') AS scheduled
     FROM announcements ${manager ? "" : `WHERE announcements.audience IN (${audiences.map(() => "?").join(", ")})`}`,
    manager ? [user.id] : [user.id, ...audiences]
  );
  return { active: Number(row.active ?? 0), scheduled: manager ? Number(row.scheduled ?? 0) : 0 };
}

const cleanText = (value, label, max) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed;
};
const cleanDate = (value, label) => {
  if (value == null || value === "") return null;
  const date = new Date(value);
  if (typeof value !== "string" || Number.isNaN(date.getTime())) throw new ApiError(`${label} must be a valid date and time.`);
  return date;
};

// DATETIME columns round fractional seconds (up), which could push "now" a second into the future
const wholeSeconds = (date) => (date ? new Date(Math.floor(date.getTime() / 1000) * 1000) : date);

function fields(body, { existing } = {}) {
  const priority = body.priority === undefined ? existing?.priority ?? "normal" : String(body.priority).toLowerCase();
  if (!PRIORITIES.includes(priority)) throw new ApiError("Choose a valid priority.");
  const audience = body.audience ?? existing?.audience ?? "All Employees";
  if (!(audience in AUDIENCES)) throw new ApiError("Choose a valid audience.");
  const publishAt = body.publishAt === undefined ? (existing ? new Date(existing.publishAt) : new Date()) : cleanDate(body.publishAt, "Publish time") ?? new Date();
  const expiresAt = body.expiresAt === undefined ? (existing?.expiresAt ? new Date(existing.expiresAt) : null) : cleanDate(body.expiresAt, "Expiry");
  if (!existing && publishAt < new Date(Date.now() - 5 * 60000)) throw new ApiError("The publish time can't be in the past.");
  if (publishAt > new Date(Date.now() + 366 * 86400000)) throw new ApiError("Announcements can be scheduled up to a year ahead.");
  if (expiresAt && expiresAt <= publishAt) throw new ApiError("The expiry must be after the publish time.");
  return {
    title: body.title === undefined ? existing.title : cleanText(body.title, "Title", 160),
    body: body.body === undefined ? existing.body : cleanText(body.body, "Message", 5000),
    priority,
    audience,
    publishAt: wholeSeconds(publishAt),
    expiresAt: wholeSeconds(expiresAt),
    notify: body.notify === undefined ? existing?.notify ?? true : Boolean(body.notify),
  };
}

export async function createAnnouncement(user, body) {
  if (!canManageAnnouncements(user)) throw new Error("FORBIDDEN");
  const item = fields(body ?? {});
  const id = createId("announce");
  await query(
    "INSERT INTO announcements (id, title, body, priority, audience, publish_at, expires_at, notify, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, item.title, item.body, item.priority, item.audience, item.publishAt, item.expiresAt, item.notify ? 1 : 0, user.id, user.name]
  );
  const scheduled = item.publishAt > new Date();
  await recordAudit(user, { action: "announcement.created", entityType: "announcement", entityId: id, summary: `${scheduled ? "Scheduled" : "Published"} announcement "${item.title}" for ${item.audience}` });
  return getAnnouncement(user, id);
}

async function loadAnnouncement(id) {
  const [row] = await query(`SELECT ${COLUMNS} FROM announcements WHERE id = ?`, [id]);
  if (!row) throw new ApiError("Announcement not found.", 404);
  return row;
}

export async function getAnnouncement(user, id) {
  return toAnnouncement(await loadAnnouncement(id), user);
}

// Edit text/dates, or { archived: true | false }
export async function updateAnnouncement(user, id, body) {
  if (!canManageAnnouncements(user)) throw new Error("FORBIDDEN");
  const row = await loadAnnouncement(id);
  if (!canChange(user, row)) throw new ApiError("Only the author or a Super Admin can change this announcement.", 403);
  if (body.archived !== undefined) {
    await query("UPDATE announcements SET archived_at = ?, updated_at = NOW() WHERE id = ?", [body.archived ? new Date() : null, id]);
    await recordAudit(user, { action: "announcement.updated", entityType: "announcement", entityId: id, summary: `${body.archived ? "Archived" : "Restored"} announcement "${row.title}"` });
    return getAnnouncement(user, id);
  }
  const item = fields(body, { existing: row });
  await query(
    "UPDATE announcements SET title = ?, body = ?, priority = ?, audience = ?, publish_at = ?, expires_at = ?, notify = ?, updated_at = NOW() WHERE id = ?",
    [item.title, item.body, item.priority, item.audience, item.publishAt, item.expiresAt, item.notify ? 1 : 0, id]
  );
  await recordAudit(user, { action: "announcement.updated", entityType: "announcement", entityId: id, summary: `Edited announcement "${item.title}"` });
  return getAnnouncement(user, id);
}

// Only announcements nobody has seen yet (still scheduled) can be deleted; others are archived
export async function deleteAnnouncement(user, id) {
  if (!canManageAnnouncements(user)) throw new Error("FORBIDDEN");
  const row = await loadAnnouncement(id);
  if (!canChange(user, row)) throw new ApiError("Only the author or a Super Admin can delete this announcement.", 403);
  if (row.status !== "scheduled") throw new ApiError("Published announcements are archived, not deleted.", 409);
  await query("DELETE FROM announcements WHERE id = ?", [id]);
  await recordAudit(user, { action: "announcement.deleted", entityType: "announcement", entityId: id, summary: `Deleted scheduled announcement "${row.title}"` });
}

// Hide an active announcement from this person's own list
export async function dismissAnnouncement(user, id) {
  const row = await loadAnnouncement(id);
  if (!canManageAnnouncements(user) && !audiencesFor(user.role).includes(row.audience)) throw new ApiError("Announcement not found.", 404);
  await query("INSERT IGNORE INTO announcement_dismissals (announcement_id, user_id) VALUES (?, ?)", [id, user.id]);
}

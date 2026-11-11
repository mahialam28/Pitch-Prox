import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { ADMIN_ROLES, CUSTOMER_ROLES, ROLES, dashboardPathFor } from "@/utils.js/roles";

// ── In-app notifications (the bell) ──
// notify() is called where things happen (policy to sign, training assigned, incident assigned,
// coaching note, ticket reply, approvals). A failed notification never breaks the action itself.
// People who set Settings → Notifications → In-App Notifications to "Off" or "Email Only" get none.

export const NOTIFICATION_TYPES = ["policy", "training", "incident", "coaching", "ticket", "approval", "lead", "privacy"];
const KEEP_DAYS = 90;
const MUTED = new Set(["off", "email-only"]);
const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value) || {};
const cut = (value, max) => (value == null ? null : String(value).replace(/\s+/g, " ").trim().slice(0, max) || null);

// Where a person lands for things in their own portal
export const portalHome = (role) => dashboardPathFor(role) ?? "/";
export const ticketLink = (role, ticketId) =>
  CUSTOMER_ROLES.includes(role) ? "/user/settings/support-ticket/tickets" : ADMIN_ROLES.includes(role) ? `/super-admin/support-tickets?ticket=${encodeURIComponent(ticketId)}` : "/internal-sales-representative/support-tickets";

// recipients: [{ id, role }] or user ids; link may be a function of the recipient's role.
// The person who caused it (`actor`) is never notified about their own action.
export async function notify(recipients, { type, title, body = null, link = null, entityType = null, entityId = null, actor = null }) {
  try {
    if (!NOTIFICATION_TYPES.includes(type)) throw new Error(`Unknown notification type ${type}`);
    const ids = [...new Set(recipients.map((item) => (typeof item === "string" ? item : item?.id)).filter(Boolean))].filter((id) => id !== actor?.id);
    if (!ids.length) return 0;
    const placeholders = ids.map(() => "?").join(", ");
    const people = await query(
      `SELECT users.id, users.role, user_settings.notifications FROM users
       LEFT JOIN staff_profiles ON staff_profiles.user_id = users.id
       LEFT JOIN user_settings ON user_settings.user_id = users.id
       WHERE users.id IN (${placeholders}) AND (staff_profiles.status IS NULL OR staff_profiles.status <> 'deactivated')`,
      ids
    );
    let sent = 0;
    for (const person of people) {
      if (MUTED.has(parse(person.notifications).inAppNotifications)) continue;
      const target = typeof link === "function" ? link(person.role) : link;
      await query("INSERT INTO notifications (id, user_id, type, title, body, link, entity_type, entity_id, actor_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        createId("ntf"), person.id, type, cut(title, 160), cut(body, 500), cut(target, 300), entityType, entityId, cut(actor?.name, 255),
      ]);
      sent += 1;
    }
    return sent;
  } catch (error) {
    console.error("Notification not recorded", error);
    return 0;
  }
}

// Everyone with one of these roles (active staff only)
export async function usersWithRoles(roles) {
  if (!roles.length) return [];
  return query(
    `SELECT users.id, users.role FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id
     WHERE users.role IN (${roles.map(() => "?").join(", ")}) AND staff_profiles.status = 'active'`,
    roles
  );
}

export const superAdmins = () => usersWithRoles([ROLES.SUPER_ADMIN]);

const present = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  body: row.body,
  link: row.link,
  actorName: row.actor_name,
  isUnread: !row.read_at,
  readAt: row.read_at,
  createdAt: row.created_at,
});

// Latest first; ?unread=1 for unread only. Old read ones are cleared out as we go.
export async function listNotifications(user, { limit = 30, before = null, unread = false } = {}) {
  await query("DELETE FROM notifications WHERE user_id = ? AND read_at IS NOT NULL AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)", [user.id, KEEP_DAYS]);
  const size = Math.min(Math.max(Number.parseInt(limit, 10) || 30, 1), 100);
  const clauses = ["user_id = ?"];
  const values = [user.id];
  if (unread) clauses.push("read_at IS NULL");
  if (before) {
    const date = new Date(before);
    if (Number.isNaN(date.getTime())) throw new ApiError("Invalid 'before' date.");
    clauses.push("created_at < ?");
    values.push(date);
  }
  const rows = await query(`SELECT * FROM notifications WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC, id DESC LIMIT ${size + 1}`, values);
  const [{ unreadCount }] = await query("SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND read_at IS NULL", [user.id]);
  return { results: rows.slice(0, size).map(present), hasMore: rows.length > size, unreadCount: Number(unreadCount) };
}

export async function unreadCount(user) {
  const [{ count }] = await query("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL", [user.id]);
  return Number(count);
}

async function own(user, id) {
  const [row] = await query("SELECT * FROM notifications WHERE id = ? AND user_id = ?", [id, user.id]);
  if (!row) throw new ApiError("Notification not found.", 404);
  return row;
}

export async function setRead(user, id, read = true) {
  await own(user, id);
  await query(`UPDATE notifications SET read_at = ${read ? "COALESCE(read_at, NOW())" : "NULL"} WHERE id = ?`, [id]);
  return { notification: present(await own(user, id)), unreadCount: await unreadCount(user) };
}

export async function markAllRead(user) {
  const result = await query("UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL", [user.id]);
  return { marked: result.affectedRows, unreadCount: 0 };
}

export async function deleteNotification(user, id) {
  await own(user, id);
  await query("DELETE FROM notifications WHERE id = ?", [id]);
  return { deleted: true, unreadCount: await unreadCount(user) };
}

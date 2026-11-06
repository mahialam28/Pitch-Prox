import { query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { describeUserAgent } from "@/utils.js/user-agent";

const SESSION_DAYS = 7;

// The user's signed-in devices (sessions that haven't expired), current first
export async function listSessions(user) {
  const rows = await query("SELECT id, ip, user_agent AS userAgent, created_at AS createdAt, last_seen_at AS lastSeenAt FROM sessions WHERE user_id = ? AND impersonation_id IS NULL AND expires_at > CURRENT_TIMESTAMP ORDER BY id = ? DESC, COALESCE(last_seen_at, created_at) DESC", [user.id, user.sessionId]);
  return rows.map((row) => ({ ...row, ...describeUserAgent(row.userAgent), isCurrent: row.id === user.sessionId }));
}

async function requireOwnSession(user, id) {
  const [row] = await query("SELECT id FROM sessions WHERE id = ? AND user_id = ?", [id, user.id]);
  if (!row) throw new ApiError("Device not found.", 404);
}

// Sign a device out. The current device signs out with the normal Log out button.
export async function revokeSession(user, id) {
  if (id === user.sessionId) throw new ApiError("Use Log out to sign out of this device.");
  await requireOwnSession(user, id);
  await query("DELETE FROM sessions WHERE id = ? AND user_id = ?", [id, user.id]);
}

export async function revokeOtherSessions(user) {
  const result = await query("DELETE FROM sessions WHERE user_id = ? AND id <> ?", [user.id, user.sessionId]);
  return result.affectedRows;
}

// Keep a device signed in for another full period
export async function refreshSession(user, id) {
  await requireOwnSession(user, id);
  await query(`UPDATE sessions SET expires_at = CURRENT_TIMESTAMP + INTERVAL ${SESSION_DAYS} DAY WHERE id = ? AND user_id = ?`, [id, user.id]);
}

export async function listLoginActivity(user) {
  const rows = await query("SELECT id, success, ip, user_agent AS userAgent, created_at AS createdAt FROM login_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", [user.id]);
  return rows.map((row) => ({ ...row, success: Boolean(row.success), ...describeUserAgent(row.userAgent) }));
}

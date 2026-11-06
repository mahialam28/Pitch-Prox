import { createId, query } from "@/lib/db";
import { eventByKey } from "@/lib/campaigns/catalog";

// ── User events ──
// Recorded when something happens to a customer user. The job runner reads new events
// to start journeys ("User Event" triggers), check exit conditions and send transactional emails.
// Never let a failure here break the action that caused it.

export async function recordUserEvent(userId, event, data = null) {
  if (!eventByKey(event)) throw new Error(`Unknown user event: ${event}`);
  try {
    const [user] = await query("SELECT organization_id AS organizationId FROM users WHERE id = ?", [userId]);
    if (!user) return;
    await query("INSERT INTO user_events (id, user_id, organization_id, event, data) VALUES (?, ?, ?, ?, ?)", [createId("uev"), userId, user.organizationId, event, data ? JSON.stringify(data) : null]);
  } catch (error) {
    console.error("recordUserEvent failed", event, error);
  }
}

// Account-level events (plan changes, billing) go to the account owner(s)
export async function recordAccountEvent(organizationId, event, data = null) {
  try {
    const owners = await query("SELECT id FROM users WHERE organization_id = ? AND role = 'customer_admin'", [organizationId]);
    for (const owner of owners) await recordUserEvent(owner.id, event, data);
  } catch (error) {
    console.error("recordAccountEvent failed", event, error);
  }
}

// Signing in after a break of 7+ days counts as "User Logged Back In"
export const LOGGED_BACK_IN_DAYS = 7;
export async function recordLogin(user) {
  if (!["customer_admin", "customer_member"].includes(user.role)) return;
  try {
    const [previous] = await query("SELECT MAX(created_at) AS lastAt FROM login_events WHERE user_id = ? AND success = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 5 SECOND)", [user.id]);
    if (!previous?.lastAt) return;
    const daysAway = Math.floor((Date.now() - new Date(previous.lastAt)) / 86400000);
    if (daysAway >= LOGGED_BACK_IN_DAYS) await recordUserEvent(user.id, "user_logged_back_in", { daysAway });
  } catch (error) {
    console.error("recordLogin failed", error);
  }
}

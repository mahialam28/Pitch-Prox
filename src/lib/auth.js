import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createId, hashToken, query } from "@/lib/db";
import { PORTAL_ROLES, dashboardPathFor } from "@/utils.js/roles";

export const SESSION_COOKIE = "pitchprox_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

// The visitor's IP and browser description. NGINX (CloudPanel) sets X-Real-IP to the connecting
// address, which the visitor can't fake. The first X-Forwarded-For entry is whatever the visitor sent,
// so only the last one (added by our proxy) is used, and only when X-Real-IP is missing.
export async function requestClient() {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean) ?? [];
  const ip = list.get("x-real-ip")?.trim() || forwarded[forwarded.length - 1] || null;
  return { ip: ip?.slice(0, 64) ?? null, userAgent: list.get("user-agent")?.slice(0, 500) ?? null };
}

// Impersonation keeps the staff member's own session here while they view a customer's portal
export const STAFF_SESSION_COOKIE = "pitchprox_staff_session";

const cookieOptions = (maxAge) => ({ httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });

// "Remember me" on the sign-in form keeps the device signed in for 30 days instead of 7
export const REMEMBER_ME_SECONDS = 60 * 60 * 24 * 30;

export async function createSession(userId, { impersonationId = null, maxAgeSeconds = sessionDurationSeconds } = {}) {
  // Expired sessions are only clutter (they no longer work): clear this person's while we're here
  await query("DELETE FROM sessions WHERE user_id = ? AND expires_at < CURRENT_TIMESTAMP", [userId]);
  const token = createId("session");
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
  const { ip, userAgent } = await requestClient();
  await query("INSERT INTO sessions (id, user_id, token_hash, expires_at, ip, user_agent, last_seen_at, impersonation_id) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)", [createId("sess"), userId, hashToken(token), expiresAt, ip, userAgent, impersonationId]);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions(maxAgeSeconds));
  return token;
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // Deactivated staff and suspended or deleted customer accounts have no valid session;
  // an impersonation session also ends when it is exited or runs out
  const rows = await query(`
    SELECT users.id, users.name, users.email, users.role, users.organization_id AS organizationId,
      organizations.name AS organizationName, sessions.id AS sessionId, staff_profiles.status AS staffStatus,
      impersonation_sessions.id AS impersonationId, impersonation_sessions.access AS impersonationAccess,
      impersonation_sessions.expires_at AS impersonationExpiresAt, impersonators.name AS impersonatorName
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    JOIN organizations ON organizations.id = users.organization_id
    LEFT JOIN staff_profiles ON staff_profiles.user_id = users.id
    LEFT JOIN customer_accounts ON customer_accounts.organization_id = users.organization_id
    LEFT JOIN impersonation_sessions ON impersonation_sessions.id = sessions.impersonation_id
    LEFT JOIN users AS impersonators ON impersonators.id = impersonation_sessions.staff_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      AND (staff_profiles.status IS NULL OR staff_profiles.status <> 'deactivated')
      AND (customer_accounts.status IS NULL OR customer_accounts.status = 'active')
      AND (sessions.impersonation_id IS NULL OR impersonation_sessions.ended_at IS NULL)
  `, [hashToken(token), new Date()]);
  if (!rows[0]) return null;
  const { impersonationId, impersonationAccess, impersonationExpiresAt, impersonatorName, ...user } = rows[0];
  user.impersonation = impersonationId ? { id: impersonationId, access: impersonationAccess, expiresAt: impersonationExpiresAt, staffName: impersonatorName } : null;
  // "Last active" for the devices list; written at most every 5 minutes per session
  await query("UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ? AND (last_seen_at IS NULL OR last_seen_at < CURRENT_TIMESTAMP - INTERVAL 5 MINUTE)", [user.sessionId]);
  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(...roles) {
  const user = await requireCurrentUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

// Staff who were invited (or started onboarding) but haven't finished it yet
export const isOnboarding = (user) => user?.staffStatus === "invited" || user?.staffStatus === "onboarding";

// Server-side guard for a portal layout: no session → sign-in, wrong role →
// the user's own portal. Returns the user when they belong here.
export async function guardPortal(portal) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!PORTAL_ROLES[portal].includes(user.role)) redirect(dashboardPathFor(user.role) ?? "/sign-in");
  // New employees finish onboarding before they can use their portal
  if (isOnboarding(user)) redirect("/onboarding");
  return user;
}

// Keep signed-in users off the sign-in/sign-up pages. A database outage must
// not take the sign-in page down, so lookup failures are logged and ignored.
export async function redirectIfSignedIn() {
  // Read the cookie outside the try so Next.js still sees this page as dynamic
  if (!(await cookies()).has(SESSION_COOKIE)) return;
  let user = null;
  try { user = await getCurrentUser(); } catch (error) { console.error(error); }
  const path = isOnboarding(user) ? "/onboarding" : dashboardPathFor(user?.role);
  if (path) redirect(path);
}

// Signing out while impersonating ends the impersonation and the staff session too
export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const staffToken = store.get(STAFF_SESSION_COOKIE)?.value;
  if (token) {
    await query("UPDATE impersonation_sessions JOIN sessions ON sessions.impersonation_id = impersonation_sessions.id SET impersonation_sessions.ended_at = NOW() WHERE sessions.token_hash = ? AND impersonation_sessions.ended_at IS NULL", [hashToken(token)]);
    await query("DELETE FROM sessions WHERE token_hash = ?", [hashToken(token)]);
  }
  if (staffToken) await query("DELETE FROM sessions WHERE token_hash = ?", [hashToken(staffToken)]);
  store.delete(SESSION_COOKIE);
  store.delete(STAFF_SESSION_COOKIE);
}

// The session of a staff member who is impersonating, by its cookie
export async function swapToStaffSession() {
  const store = await cookies();
  const staffToken = store.get(STAFF_SESSION_COOKIE)?.value;
  const token = store.get(SESSION_COOKIE)?.value;
  if (!staffToken) return false;
  if (token) await query("DELETE FROM sessions WHERE token_hash = ? AND impersonation_id IS NOT NULL", [hashToken(token)]);
  const [staff] = await query("SELECT expires_at AS expiresAt FROM sessions WHERE token_hash = ? AND expires_at > ?", [hashToken(staffToken), new Date()]);
  store.delete(STAFF_SESSION_COOKIE);
  if (!staff) {
    store.delete(SESSION_COOKIE);
    return false;
  }
  store.set(SESSION_COOKIE, staffToken, cookieOptions(Math.max(60, Math.floor((new Date(staff.expiresAt) - Date.now()) / 1000))));
  return true;
}

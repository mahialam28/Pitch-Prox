import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createId, hashToken, query } from "@/lib/db";
import { PORTAL_ROLES, dashboardPathFor } from "@/utils.js/roles";

export const SESSION_COOKIE = "pitchprox_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

// The visitor's IP (NGINX passes it in X-Forwarded-For) and browser description
export async function requestClient() {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0].trim() || list.get("x-real-ip") || null;
  return { ip: ip?.slice(0, 64) ?? null, userAgent: list.get("user-agent")?.slice(0, 500) ?? null };
}

export async function createSession(userId) {
  const token = createId("session");
  const expiresAt = new Date(Date.now() + sessionDurationSeconds * 1000);
  const { ip, userAgent } = await requestClient();
  await query("INSERT INTO sessions (id, user_id, token_hash, expires_at, ip, user_agent, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", [createId("sess"), userId, hashToken(token), expiresAt, ip, userAgent]);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationSeconds,
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await query(`
    SELECT users.id, users.name, users.email, users.role, users.organization_id AS organizationId,
      organizations.name AS organizationName, sessions.id AS sessionId, staff_profiles.status AS staffStatus
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    JOIN organizations ON organizations.id = users.organization_id
    LEFT JOIN staff_profiles ON staff_profiles.user_id = users.id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      AND (staff_profiles.status IS NULL OR staff_profiles.status <> 'deactivated')
  `, [hashToken(token), new Date()]);
  if (!rows[0]) return null;
  // "Last active" for the devices list; written at most every 5 minutes per session
  await query("UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ? AND (last_seen_at IS NULL OR last_seen_at < CURRENT_TIMESTAMP - INTERVAL 5 MINUTE)", [rows[0].sessionId]);
  return rows[0];
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

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await query("DELETE FROM sessions WHERE token_hash = ?", [hashToken(token)]);
  store.delete(SESSION_COOKIE);
}

import { NextResponse } from "next/server";
import { createId, query } from "@/lib/db";
import { REMEMBER_ME_SECONDS, createSession, requestClient } from "@/lib/auth";
import { recordLogin } from "@/lib/campaigns/events";
import { recordAudit } from "@/lib/audit";
import { needsCalibrationPrompt } from "@/lib/calibration";
import { STAFF_ROLES } from "@/utils.js/roles";

// The user row sign-in works with: account and staff status, and whether a password is set
export const SIGN_IN_USER = "SELECT users.*, staff_profiles.status AS staff_status, customer_accounts.status AS account_status, COALESCE(staff_profiles.password_set, users.password_set) AS password_usable FROM users LEFT JOIN staff_profiles ON staff_profiles.user_id = users.id LEFT JOIN customer_accounts ON customer_accounts.organization_id = users.organization_id";

export const actorOf = (user, email) => (user ? { id: user.id, name: user.name, role: user.role, organizationId: user.organization_id } : { id: null, name: email, role: "unknown" });

// Every attempt is kept for the account's login activity
export async function recordLoginEvent(user, email, success) {
  const { ip, userAgent } = await requestClient();
  await query("INSERT INTO login_events (id, user_id, email, success, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)", [createId("login"), user?.id ?? null, email, success ? 1 : 0, ip, userAgent]);
}

// Suspended, closed or deactivated accounts can't sign in even with the right password
export function blockedReason(user) {
  if (user.account_status === "suspended") return { message: "This account is suspended. Contact PitchProX support.", status: 403 };
  if (user.account_status === "deleted") return { message: "This account has been closed.", status: 403 };
  if (user.staff_status === "deactivated") return { message: "This account has been deactivated. Contact your administrator.", status: 403 };
  return null;
}

// Password (and two-step code, if on) accepted: record it, start the session, answer the form
export async function completeSignIn(user, { method = "password", remember = false } = {}) {
  await recordLoginEvent(user, user.email, true);
  if (STAFF_ROLES.includes(user.role)) {
    await recordAudit(actorOf(user), { action: "security.sign_in", entityType: "user", entityId: user.id, summary: `${user.name} signed in${method === "recovery" ? " with a recovery code" : method === "app" ? " (two-step)" : ""}` });
  } else if (method === "recovery") {
    await recordAudit(actorOf(user), { action: "security.sign_in", entityType: "user", entityId: user.id, organizationId: user.organization_id, summary: `${user.name} signed in with a recovery code` });
  }
  await recordLogin(user);
  await createSession(user.id, remember ? { maxAgeSeconds: REMEMBER_ME_SECONDS } : undefined);
  // Customers who haven't calibrated (and didn't choose "Do it later") go to calibration first
  const needsCalibration = await needsCalibrationPrompt({ id: user.id, role: user.role });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: user.organization_id, staffStatus: user.staff_status ?? null, needsCalibration } });
}

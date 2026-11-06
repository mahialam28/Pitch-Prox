import { NextResponse } from "next/server";
import { createId, query, verifyPassword } from "@/lib/db";
import { createSession, requestClient } from "@/lib/auth";
import { jsonError, readJson, withApi } from "@/lib/api";

export const runtime = "nodejs";

export const POST = withApi(async (request) => {
  const { email, password } = await readJson(request);
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return jsonError("Email and password are required.");
  }
  const normalized = email.trim().toLowerCase().slice(0, 255);
  const [user] = await query("SELECT users.*, staff_profiles.status AS staff_status, customer_accounts.status AS account_status, COALESCE(staff_profiles.password_set, users.password_set) AS password_usable FROM users LEFT JOIN staff_profiles ON staff_profiles.user_id = users.id LEFT JOIN customer_accounts ON customer_accounts.organization_id = users.organization_id WHERE users.email = ?", [normalized]);
  // Invited employees and rep-created customers have no password until they activate
  const passwordUsable = user && Number(user.password_usable) !== 0;
  const success = Boolean(passwordUsable && verifyPassword(password, user.password_salt, user.password_hash));
  // Every attempt is recorded for the account's login activity (and later the audit log)
  const { ip, userAgent } = await requestClient();
  await query("INSERT INTO login_events (id, user_id, email, success, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)", [createId("login"), user?.id ?? null, normalized, success ? 1 : 0, ip, userAgent]);
  if (!success) {
    if (user && !passwordUsable) return jsonError("Finish setting up your account with the invite link you received.", 401);
    return jsonError("Invalid email or password.", 401);
  }
  if (user.account_status === "suspended") return jsonError("This account is suspended. Contact PitchProX support.", 403);
  if (user.account_status === "deleted") return jsonError("This account has been closed.", 403);
  if (user.staff_status === "deactivated") return jsonError("This account has been deactivated. Contact your administrator.", 403);
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: user.organization_id, staffStatus: user.staff_status ?? null } });
});

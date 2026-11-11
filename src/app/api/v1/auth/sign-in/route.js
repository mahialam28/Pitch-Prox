import { NextResponse } from "next/server";
import { query, verifyPassword } from "@/lib/db";
import { requestClient } from "@/lib/auth";
import { jsonError, readJson, withApi } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { assertNotLimited, clearHits, recordHit } from "@/lib/rate-limit";
import { createChallenge, mfaEnabled } from "@/lib/mfa";
import { SIGN_IN_USER, actorOf, blockedReason, completeSignIn, recordLoginEvent } from "@/lib/sign-in";

export const runtime = "nodejs";

// { email, password, remember? } → signed in (30 days with remember, else 7), or { mfaRequired, challengeToken } when two-step login is on
// (then POST /api/v1/auth/sign-in/verify with the code). Wrong passwords are limited per email
// (5 in 15 minutes) and per IP (30 in 15 minutes).
export const POST = withApi(async (request) => {
  const { email, password, remember = false } = await readJson(request);
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return jsonError("Email and password are required.");
  }
  const normalized = email.trim().toLowerCase().slice(0, 255);
  const { ip } = await requestClient();
  await assertNotLimited("sign-in-email", normalized);
  await assertNotLimited("sign-in-ip", ip);

  const [user] = await query(`${SIGN_IN_USER} WHERE users.email = ?`, [normalized]);
  // Invited employees and rep-created customers have no password until they activate
  const passwordUsable = user && Number(user.password_usable) !== 0;
  const success = Boolean(passwordUsable && verifyPassword(password, user.password_salt, user.password_hash));
  if (!success) {
    await recordLoginEvent(user, normalized, false);
    await recordHit("sign-in-email", normalized);
    await recordHit("sign-in-ip", ip);
    // Audit log (Compliance → Audit Logs): every failed attempt
    await recordAudit(actorOf(user, normalized), { action: "security.sign_in_failed", entityType: "user", entityId: user?.id ?? null, summary: `Failed sign-in for ${normalized}${user && !passwordUsable ? " (account not activated)" : ""}` });
    if (user && !passwordUsable) return jsonError("Finish setting up your account with the invite link you received.", 401);
    return jsonError("Invalid email or password.", 401);
  }
  const blocked = blockedReason(user);
  if (blocked) return jsonError(blocked.message, blocked.status);
  await clearHits("sign-in-email", normalized);

  if (await mfaEnabled(user.id)) {
    return NextResponse.json({ mfaRequired: true, challengeToken: await createChallenge(user.id, { remember: remember === true }) });
  }
  return completeSignIn(user, { remember: remember === true });
});

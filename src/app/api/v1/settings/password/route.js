import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { hashPassword, query, verifyPassword } from "@/lib/db";
import { jsonError, readJson, withApi } from "@/lib/api";
import { assertNotLimited, clearHits, recordHit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const PATCH = withApi(async (request) => {
  const user = await requireCurrentUser(); const { currentPassword, newPassword } = await readJson(request);
  if (typeof newPassword !== "string" || newPassword.length < 8) return jsonError("Your new password must be at least 8 characters.");
  const [account] = await query("SELECT password_hash, password_salt FROM users WHERE id = ?", [user.id]);
  // Guessing the current password from a signed-in device is limited too
  await assertNotLimited("password-change-user", user.id);
  if (!account || typeof currentPassword !== "string" || !verifyPassword(currentPassword, account.password_salt, account.password_hash)) {
    await recordHit("password-change-user", user.id);
    return jsonError("Your current password is incorrect.", 403);
  }
  await clearHits("password-change-user", user.id);
  const { hash, salt } = hashPassword(newPassword);
  await query("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", [hash, salt, user.id]);
  // A new password signs out every other device, in case the old one leaked
  await query("DELETE FROM sessions WHERE user_id = ? AND id <> ?", [user.id, user.sessionId]);
  return NextResponse.json({ success: true });
});

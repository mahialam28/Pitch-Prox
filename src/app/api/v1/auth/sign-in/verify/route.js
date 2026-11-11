import { hashToken, query } from "@/lib/db";
import { ApiError, jsonError, readJson, withApi } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { verifyChallenge } from "@/lib/mfa";
import { SIGN_IN_USER, actorOf, blockedReason, completeSignIn, recordLoginEvent } from "@/lib/sign-in";

export const runtime = "nodejs";

// Second step: { challengeToken, code } where code is the 6-digit app code or a recovery code
export const POST = withApi(async (request) => {
  const { challengeToken, code } = await readJson(request);
  let result;
  try {
    result = await verifyChallenge(challengeToken, code);
  } catch (error) {
    // A wrong code counts as a failed sign-in in the account's login activity
    if (error instanceof ApiError && error.status === 401 && /didn't match/.test(error.message)) {
      const [challenge] = await query("SELECT users.id, users.email, users.name, users.role, users.organization_id FROM mfa_challenges JOIN users ON users.id = mfa_challenges.user_id WHERE mfa_challenges.token_hash = ?", [hashToken(String(challengeToken))]);
      if (challenge) {
        await recordLoginEvent(challenge, challenge.email, false);
        await recordAudit(actorOf(challenge), { action: "security.sign_in_failed", entityType: "user", entityId: challenge.id, summary: `Wrong two-step code for ${challenge.email}` });
      }
    }
    throw error;
  }
  const [user] = await query(`${SIGN_IN_USER} WHERE users.id = ?`, [result.userId]);
  if (!user) return jsonError("Sign in again.", 401);
  const blocked = blockedReason(user);
  if (blocked) return jsonError(blocked.message, blocked.status);
  return completeSignIn(user, { method: result.method, remember: result.remember });
});

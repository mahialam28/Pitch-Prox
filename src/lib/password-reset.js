import { randomBytes } from "node:crypto";
import { createId, hashPassword, hashToken, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { sendPasswordResetEmail } from "@/lib/email/system";

// ── Forgot / reset password ──
// The link is emailed on the Transactional stream, works once and expires in an hour.
// The answer to "forgot password" is the same whether or not the address has an account,
// so the form can't be used to find out who uses PitchProX.

const RESET_MINUTES = 60;
const MAX_LINKS_PER_15_MINUTES = 3;

export async function requestPasswordReset(email, { ip = null } = {}) {
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) throw new ApiError("Enter a valid email address.");
  // Not for: deactivated staff, staff who haven't accepted their invite yet (they use the invite link),
  // suspended/deleted customer accounts, customers who haven't activated (they use the activation link)
  const [user] = await query(
    `SELECT users.id, users.name, users.email FROM users
     LEFT JOIN staff_profiles ON staff_profiles.user_id = users.id
     LEFT JOIN customer_accounts ON customer_accounts.organization_id = users.organization_id
     WHERE users.email = ?
       AND (staff_profiles.status IS NULL OR staff_profiles.status NOT IN ('deactivated', 'invited'))
       AND (customer_accounts.status IS NULL OR customer_accounts.status = 'active')
       AND (staff_profiles.user_id IS NOT NULL OR users.password_set = 1)`,
    [email.trim().toLowerCase()]
  );
  if (!user) return;
  const [{ recent }] = await query("SELECT COUNT(*) AS recent FROM password_resets WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)", [user.id]);
  if (Number(recent) >= MAX_LINKS_PER_15_MINUTES) return;
  const token = randomBytes(32).toString("base64url");
  await query("INSERT INTO password_resets (id, user_id, token_hash, expires_at, ip) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)", [createId("reset"), user.id, hashToken(token), RESET_MINUTES, ip]);
  await sendPasswordResetEmail({ userId: user.id, name: user.name, email: user.email, token });
}

async function findReset(token) {
  if (typeof token !== "string" || token.length < 20) throw new ApiError("This reset link is not valid.", 400);
  const [reset] = await query("SELECT id, user_id AS userId, used_at AS usedAt, expires_at > NOW() AS live FROM password_resets WHERE token_hash = ?", [hashToken(token)]);
  if (!reset) throw new ApiError("This reset link is not valid.", 404);
  if (reset.usedAt) throw new ApiError("This reset link was already used. Ask for a new one if you need to.", 410);
  if (!reset.live) throw new ApiError("This reset link has expired. Ask for a new one.", 410);
  return reset;
}

// Lets the reset page say early that a link is no good
export async function checkResetToken(token) {
  await findReset(token);
  return { valid: true };
}

// New password → every session of the account is signed out
export async function resetPassword(token, password) {
  if (typeof password !== "string" || password.length < 8) throw new ApiError("Password must be at least 8 characters.");
  if (password.length > 200) throw new ApiError("Password is too long.");
  const reset = await findReset(token);
  const used = await query("UPDATE password_resets SET used_at = NOW() WHERE id = ? AND used_at IS NULL", [reset.id]);
  if (!used.affectedRows) throw new ApiError("This reset link was already used. Ask for a new one if you need to.", 410);
  const { salt, hash } = hashPassword(password);
  await query("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", [hash, salt, reset.userId]);
  await query("UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL", [reset.userId]);
  await query("DELETE FROM sessions WHERE user_id = ?", [reset.userId]);
  const [user] = await query("SELECT id, name, role, organization_id AS organizationId FROM users WHERE id = ?", [reset.userId]);
  await recordAudit(user, { action: "auth.password_reset", entityType: "user", entityId: user.id, organizationId: user.organizationId, summary: `${user.name} reset their password with an email link` });
  return { ok: true };
}

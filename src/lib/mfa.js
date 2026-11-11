import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import QRCode from "qrcode";
import { createId, hashToken, query, verifyPassword } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { assertNotLimited, recordHit } from "@/lib/rate-limit";

// ── Two-step login with an authenticator app (TOTP, RFC 6238) ──
// Works with Google Authenticator, Microsoft Authenticator, 1Password, Authy… and needs no SMS or
// email provider. 6 digits, 30-second steps, one step of clock drift allowed either way, and a code
// can't be used twice. Secrets are stored encrypted (AES-256-GCM); recovery codes only as hashes.

const ISSUER = "PitchProX";
const STEP_SECONDS = 30;
const DIGITS = 6;
const RECOVERY_CODES = 10;
const CHALLENGE_MINUTES = 5;
const CHALLENGE_TRIES = 5;

// ── Base32 (RFC 4648), what authenticator apps expect ──
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
}
function base32Decode(text) {
  const clean = String(text).toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    value = (value << 5) | ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// The 6-digit code for one 30-second step
export function totp(secretBase32, step) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac("sha1", base32Decode(secretBase32)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 15;
  const number = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return String(number).padStart(DIGITS, "0");
}
const currentStep = () => Math.floor(Date.now() / 1000 / STEP_SECONDS);

// The step a code belongs to (now, or one step either side), or null
function matchingStep(secretBase32, code) {
  const now = currentStep();
  for (const step of [now, now - 1, now + 1]) {
    const expected = Buffer.from(totp(secretBase32, step));
    const given = Buffer.from(code);
    if (expected.length === given.length && timingSafeEqual(expected, given)) return step;
  }
  return null;
}

// ── Encryption of stored secrets ──
let keyPromise;
async function encryptionKey() {
  if (!keyPromise) {
    keyPromise = (async () => {
      if (process.env.APP_SECRET) return createHash("sha256").update(`mfa:${process.env.APP_SECRET}`).digest();
      await query("INSERT IGNORE INTO app_secrets (name, value) VALUES ('mfa', ?)", [randomBytes(32).toString("hex")]);
      const [row] = await query("SELECT value FROM app_secrets WHERE name = 'mfa'");
      return createHash("sha256").update(`mfa:${row.value}`).digest();
    })();
    keyPromise.catch(() => {
      keyPromise = undefined;
    });
  }
  return keyPromise;
}
async function encrypt(text) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", await encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString("base64url")).join(".");
}
async function decrypt(stored) {
  const [iv, tag, data] = String(stored).split(".").map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", await encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

// ── Recovery codes: "abcd-efgh-jkmn" (no look-alike characters) ──
const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const newRecoveryCode = () => {
  const bytes = randomBytes(12);
  const chars = [...bytes].map((byte) => RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length]).join("");
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
};
const normalizeRecovery = (code) => String(code).toLowerCase().replace(/[^a-z0-9]/g, "");

async function issueRecoveryCodes(userId) {
  await query("DELETE FROM mfa_recovery_codes WHERE user_id = ?", [userId]);
  const codes = Array.from({ length: RECOVERY_CODES }, newRecoveryCode);
  for (const code of codes) await query("INSERT INTO mfa_recovery_codes (id, user_id, code_hash) VALUES (?, ?, ?)", [createId("mfarc"), userId, hashToken(normalizeRecovery(code))]);
  return codes;
}

// ── State ──
async function record(userId) {
  const [row] = await query("SELECT secret, pending_secret AS pendingSecret, enabled_at AS enabledAt, last_step AS lastStep FROM user_mfa WHERE user_id = ?", [userId]);
  return row ?? null;
}

export async function mfaEnabled(userId) {
  const row = await record(userId);
  return Boolean(row?.enabledAt && row.secret);
}

export async function mfaStatus(user) {
  const row = await record(user.id);
  const [{ remaining }] = await query("SELECT COUNT(*) AS remaining FROM mfa_recovery_codes WHERE user_id = ? AND used_at IS NULL", [user.id]);
  return { enabled: Boolean(row?.enabledAt && row.secret), enabledAt: row?.enabledAt ?? null, recoveryCodesLeft: Number(remaining) };
}

// A 6-digit code from the app, or a recovery code. Returns "app" | "recovery" | null.
async function checkCode(userId, rawCode, { allowRecovery = true } = {}) {
  const row = await record(userId);
  if (!row?.secret) return null;
  const code = String(rawCode ?? "").replace(/\s+/g, "");
  if (/^\d{6}$/.test(code)) {
    const step = matchingStep(await decrypt(row.secret), code);
    if (step === null || (row.lastStep !== null && step <= Number(row.lastStep))) return null;
    // Remember the step so the same code can't be used again
    const used = await query("UPDATE user_mfa SET last_step = ? WHERE user_id = ? AND (last_step IS NULL OR last_step < ?)", [step, userId, step]);
    return used.affectedRows ? "app" : null;
  }
  if (allowRecovery && normalizeRecovery(code).length === 12) {
    const used = await query("UPDATE mfa_recovery_codes SET used_at = NOW() WHERE user_id = ? AND code_hash = ? AND used_at IS NULL", [userId, hashToken(normalizeRecovery(code))]);
    return used.affectedRows ? "recovery" : null;
  }
  return null;
}

// ── Setting it up (Settings → Security) ──
// Step 1: a new secret, shown as a QR code and as text. Nothing changes until it's confirmed.
export async function startMfaSetup(user) {
  if (await mfaEnabled(user.id)) throw new ApiError("Two-step login is already on. Turn it off first to set up a new app.", 409);
  const secret = base32Encode(randomBytes(20));
  await query("INSERT INTO user_mfa (user_id, pending_secret) VALUES (?, ?) ON DUPLICATE KEY UPDATE pending_secret = VALUES(pending_secret)", [user.id, await encrypt(secret)]);
  const label = `${ISSUER}:${encodeURIComponent(user.email)}`;
  const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${ISSUER}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
  return { secret: secret.match(/.{1,4}/g).join(" "), otpauthUrl, qrCode: await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 }) };
}

// Step 2: the first code from the app turns it on and returns the recovery codes (shown once).
// Other signed-in devices are signed out.
export async function confirmMfaSetup(user, code) {
  const row = await record(user.id);
  if (!row?.pendingSecret) throw new ApiError("Start the setup again: scan a new QR code.", 409);
  const clean = String(code ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) throw new ApiError("Enter the 6-digit code from your authenticator app.");
  const secret = await decrypt(row.pendingSecret);
  const step = matchingStep(secret, clean);
  if (step === null) throw new ApiError("That code didn't match. Check the time on your phone is set automatically, and try the newest code.");
  await query("UPDATE user_mfa SET secret = pending_secret, pending_secret = NULL, enabled_at = NOW(), last_step = ? WHERE user_id = ?", [step, user.id]);
  const recoveryCodes = await issueRecoveryCodes(user.id);
  await query("UPDATE staff_profiles SET mfa_method = 'authenticator' WHERE user_id = ?", [user.id]);
  await query("DELETE FROM sessions WHERE user_id = ? AND id <> ?", [user.id, user.sessionId]);
  await recordAudit(user, { action: "security.mfa_enabled", entityType: "user", entityId: user.id, organizationId: user.organizationId, summary: `${user.name} turned on two-step login (authenticator app)` });
  return { ...(await mfaStatus(user)), recoveryCodes };
}

// Turning it off needs the password and a current code (or a recovery code)
export async function disableMfa(user, { password, code }) {
  if (!(await mfaEnabled(user.id))) throw new ApiError("Two-step login is already off.", 409);
  const [account] = await query("SELECT password_hash, password_salt FROM users WHERE id = ?", [user.id]);
  if (typeof password !== "string" || !verifyPassword(password, account.password_salt, account.password_hash)) throw new ApiError("Your password is incorrect.", 403);
  await assertNotLimited("mfa-user", user.id);
  if (!(await checkCode(user.id, code))) {
    await recordHit("mfa-user", user.id);
    throw new ApiError("That code didn't match.", 403);
  }
  await turnOff(user.id);
  await recordAudit(user, { action: "security.mfa_disabled", entityType: "user", entityId: user.id, organizationId: user.organizationId, summary: `${user.name} turned off two-step login` });
  return mfaStatus(user);
}

async function turnOff(userId) {
  await query("DELETE FROM user_mfa WHERE user_id = ?", [userId]);
  await query("DELETE FROM mfa_recovery_codes WHERE user_id = ?", [userId]);
  await query("UPDATE staff_profiles SET mfa_method = NULL WHERE user_id = ? AND mfa_method = 'authenticator'", [userId]);
}

export async function regenerateRecoveryCodes(user, code) {
  if (!(await mfaEnabled(user.id))) throw new ApiError("Turn on two-step login first.", 409);
  await assertNotLimited("mfa-user", user.id);
  if ((await checkCode(user.id, code, { allowRecovery: false })) !== "app") {
    await recordHit("mfa-user", user.id);
    throw new ApiError("Enter a current code from your authenticator app.", 403);
  }
  const recoveryCodes = await issueRecoveryCodes(user.id);
  await recordAudit(user, { action: "security.mfa_recovery_codes", entityType: "user", entityId: user.id, organizationId: user.organizationId, summary: `${user.name} made new two-step recovery codes` });
  return { ...(await mfaStatus(user)), recoveryCodes };
}

// A Super Admin clears someone's two-step login (lost phone and no recovery codes). They sign in
// with their password and can set it up again.
export async function resetMfaFor(actor, userId) {
  const [target] = await query("SELECT id, name, organization_id AS organizationId FROM users WHERE id = ?", [userId]);
  if (!target) throw new ApiError("User not found.", 404);
  if (!(await mfaEnabled(userId))) throw new ApiError(`${target.name} doesn't have two-step login on.`, 409);
  await turnOff(userId);
  await query("DELETE FROM sessions WHERE user_id = ?", [userId]);
  await recordAudit(actor, { action: "security.mfa_reset", entityType: "user", entityId: userId, organizationId: target.organizationId, summary: `Reset two-step login for ${target.name}` });
  return { reset: true };
}

// ── Sign-in ──
// The password was right: a short-lived challenge for the second step (token returned once)
export async function createChallenge(userId, { remember = false } = {}) {
  const token = randomBytes(32).toString("base64url");
  await query("INSERT INTO mfa_challenges (id, user_id, token_hash, remember, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))", [createId("mfach"), userId, hashToken(token), remember ? 1 : 0, CHALLENGE_MINUTES]);
  return token;
}

// { token, code } → the user id when the code is right. Each challenge allows 5 tries.
export async function verifyChallenge(token, code) {
  if (typeof token !== "string" || token.length < 20) throw new ApiError("Sign in again.", 400);
  const [challenge] = await query("SELECT id, user_id AS userId, attempts, remember, used_at AS usedAt, expires_at > NOW() AS live FROM mfa_challenges WHERE token_hash = ?", [hashToken(token)]);
  if (!challenge || challenge.usedAt || !challenge.live || challenge.attempts >= CHALLENGE_TRIES) throw new ApiError("This sign-in has expired. Enter your email and password again.", 401);
  await assertNotLimited("mfa-user", challenge.userId);
  await query("UPDATE mfa_challenges SET attempts = attempts + 1 WHERE id = ?", [challenge.id]);
  const method = await checkCode(challenge.userId, code);
  if (!method) {
    await recordHit("mfa-user", challenge.userId);
    const left = CHALLENGE_TRIES - challenge.attempts - 1;
    throw new ApiError(left > 0 ? `That code didn't match. ${left} tr${left === 1 ? "y" : "ies"} left.` : "That code didn't match. Enter your email and password again.", 401);
  }
  const used = await query("UPDATE mfa_challenges SET used_at = NOW() WHERE id = ? AND used_at IS NULL", [challenge.id]);
  if (!used.affectedRows) throw new ApiError("This sign-in has expired. Enter your email and password again.", 401);
  await query("DELETE FROM mfa_challenges WHERE user_id = ? AND (used_at IS NOT NULL OR expires_at < NOW())", [challenge.userId]);
  return { userId: challenge.userId, method, remember: Boolean(challenge.remember) };
}

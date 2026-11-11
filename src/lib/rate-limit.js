import { query } from "@/lib/db";
import { ApiError } from "@/lib/api";

// ── Attempt limits ──
// Counts attempts per (bucket, subject) over a sliding window in MySQL, so the limit holds across
// restarts. Subjects are an email address, a user id or an IP address. An unknown IP (no proxy in
// front) or the server's own address isn't limited by IP; production runs behind NGINX, which
// always sends X-Real-IP.

const LIMITS = {
  // Wrong passwords for one email: 5 in 15 minutes, then wait
  "sign-in-email": { limit: 5, windowSeconds: 900 },
  // Wrong passwords from one IP across many emails
  "sign-in-ip": { limit: 30, windowSeconds: 900 },
  "sign-up-ip": { limit: 10, windowSeconds: 3600 },
  "forgot-password-ip": { limit: 10, windowSeconds: 3600 },
  "reset-password-ip": { limit: 20, windowSeconds: 3600 },
  "invite-link-ip": { limit: 20, windowSeconds: 3600 },
  // "See how it works" form on the website
  "demo-request-ip": { limit: 10, windowSeconds: 3600 },
  // Data deletion request form
  "data-deletion-ip": { limit: 5, windowSeconds: 3600 },
  // Wrong current password in Settings → Security → Change password
  "password-change-user": { limit: 5, windowSeconds: 900 },
  // Wrong two-step codes for one account (across sign-in challenges)
  "mfa-user": { limit: 10, windowSeconds: 900 },
  // Practice calls (simulated prospect): free, but they can use AI credits
  "practice-call-user": { limit: 30, windowSeconds: 86400 },
};

// The server itself (loopback) is never limited by IP: that's local development or a health check,
// not a visitor. Behind NGINX every visitor has their own X-Real-IP.
const LOOPBACK = /^(127\.|::1$|::ffff:127\.|localhost$)/i;
const subjectOf = (subject, bucket = "") => {
  if (subject == null || subject === "") return null;
  const value = String(subject).toLowerCase().slice(0, 191);
  return bucket.endsWith("-ip") && LOOPBACK.test(value) ? null : value;
};

function tooMany(windowSeconds, oldest) {
  const retryAfter = Math.max(1, Math.ceil((new Date(oldest).getTime() + windowSeconds * 1000 - Date.now()) / 1000));
  const minutes = Math.ceil(retryAfter / 60);
  const error = new ApiError(`Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`, 429);
  error.retryAfter = retryAfter;
  return error;
}

// Throws 429 when the subject is already at its limit (doesn't count this attempt)
export async function assertNotLimited(bucket, subject) {
  const key = subjectOf(subject, bucket);
  const rule = LIMITS[bucket];
  if (!key || !rule) return;
  const [row] = await query(
    "SELECT COUNT(*) AS hits, MIN(created_at) AS oldest FROM (SELECT created_at FROM rate_limit_hits WHERE bucket = ? AND subject = ? AND created_at > DATE_SUB(NOW(3), INTERVAL ? SECOND) ORDER BY created_at DESC LIMIT ?) AS recent",
    [bucket, key, rule.windowSeconds, rule.limit]
  );
  if (Number(row.hits) >= rule.limit) throw tooMany(rule.windowSeconds, row.oldest);
}

// Count one attempt (e.g. a wrong password). Old rows are cleared now and then.
export async function recordHit(bucket, subject) {
  const key = subjectOf(subject, bucket);
  if (!key || !LIMITS[bucket]) return;
  await query("INSERT INTO rate_limit_hits (bucket, subject) VALUES (?, ?)", [bucket, key]);
  if (Math.random() < 0.02) await query("DELETE FROM rate_limit_hits WHERE created_at < DATE_SUB(NOW(3), INTERVAL 1 DAY)");
}

// Every request counts (sign-up, password reset, invite links): check, then record
export async function limit(bucket, subject) {
  await assertNotLimited(bucket, subject);
  await recordHit(bucket, subject);
}

// Clear a subject's count (a correct password resets the wrong-password count for that email)
export async function clearHits(bucket, subject) {
  const key = subjectOf(subject, bucket);
  if (key) await query("DELETE FROM rate_limit_hits WHERE bucket = ? AND subject = ?", [bucket, key]);
}

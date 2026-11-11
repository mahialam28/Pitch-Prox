// Short-lived token that lets the browser open one call on the call service. Signed with
// CALL_SERVICE_SECRET, which the app and the call service both read from .env.local.
// Format: <callId>.<userId>.<expires epoch seconds>.<hmac>. No app imports (the call service uses it).
import { createHmac, timingSafeEqual } from "node:crypto";

const DEV_SECRET = "dev-only-call-service-secret";

export function callServiceSecret() {
  const secret = process.env.CALL_SERVICE_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("CALL_SERVICE_SECRET is not set");
  return DEV_SECRET;
}

const sign = (payload, secret) => createHmac("sha256", secret).update(payload).digest("base64url");

export function signCallToken({ callId, userId, ttlSeconds = 15 * 60 }, secret = callServiceSecret()) {
  const payload = `${callId}.${userId}.${Math.floor(Date.now() / 1000) + ttlSeconds}`;
  return `${payload}.${sign(payload, secret)}`;
}

// Returns { callId, userId } or null
export function verifyCallToken(token, secret = callServiceSecret()) {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 4) return null;
  const [callId, userId, expires, signature] = parts;
  const expected = Buffer.from(sign(`${callId}.${userId}.${expires}`, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(expires) < Date.now() / 1000) return null;
  return { callId, userId };
}

// App ↔ call service requests carry the same secret in this header
export const SERVICE_HEADER = "x-call-service-secret";
export function serviceSecretMatches(value, secret = callServiceSecret()) {
  const a = Buffer.from(String(value ?? ""));
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

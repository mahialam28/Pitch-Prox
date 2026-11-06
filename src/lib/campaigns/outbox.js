import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createId, query } from "@/lib/db";

// ── Email outbox ──
// Every customer email (broadcasts, journeys, transactional) is written here first.
// deliverQueued() hands them to the email provider; until one is connected (phase 7)
// they stay "queued" and are listed on the Campaigns pages.
// Marketing and Lifecycle emails are skipped for addresses that unsubscribed;
// Transactional emails (receipts, payment problems) always go.

export const WAITING_FOR_PROVIDER = "Waiting for an email service to be connected";

let secretPromise;
async function signingSecret() {
  if (process.env.APP_SECRET) return process.env.APP_SECRET;
  if (!secretPromise) {
    secretPromise = (async () => {
      await query("INSERT IGNORE INTO app_secrets (name, value) VALUES ('unsubscribe', ?)", [randomBytes(32).toString("hex")]);
      const [row] = await query("SELECT value FROM app_secrets WHERE name = 'unsubscribe'");
      return row.value;
    })();
    secretPromise.catch(() => { secretPromise = undefined; });
  }
  return secretPromise;
}

const sign = async (email) => createHmac("sha256", await signingSecret()).update(email.toLowerCase()).digest("base64url");

export async function unsubscribeUrl(email) {
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/api/v1/public/unsubscribe?e=${encodeURIComponent(Buffer.from(email.toLowerCase()).toString("base64url"))}&s=${await sign(email)}`;
}

// Returns the email when the link is genuine, otherwise null
export async function verifyUnsubscribe(encodedEmail, signature) {
  try {
    const email = Buffer.from(String(encodedEmail), "base64url").toString("utf8");
    const expected = Buffer.from(await sign(email));
    const given = Buffer.from(String(signature));
    return expected.length === given.length && timingSafeEqual(expected, given) ? email : null;
  } catch {
    return null;
  }
}

export async function suppress(email, reason = "unsubscribed") {
  await query("INSERT INTO email_suppressions (email, reason) VALUES (?, ?) ON DUPLICATE KEY UPDATE reason = VALUES(reason)", [email.toLowerCase(), reason]);
}

export async function suppressedSet(emails) {
  if (!emails.length) return new Set();
  const rows = await query(`SELECT email FROM email_suppressions WHERE email IN (${emails.map(() => "?").join(", ")})`, emails.map((email) => email.toLowerCase()));
  return new Set(rows.map((row) => row.email));
}

// One email for one person. A suppressed Marketing/Lifecycle email is recorded as "skipped".
export async function queueEmail({ source, sourceId = null, enrollmentId = null, template, userId, email, subject, html, suppressed = false }) {
  const id = createId("mail");
  const skip = suppressed && template.emailType !== "Transactional";
  await query(
    "INSERT INTO email_deliveries (id, source, source_id, enrollment_id, template_id, user_id, to_email, subject, html, status, status_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, source, sourceId, enrollmentId, template.id, userId, email, subject.slice(0, 255), html, skip ? "skipped" : "queued", skip ? "Unsubscribed" : WAITING_FOR_PROVIDER]
  );
  return { id, status: skip ? "skipped" : "queued" };
}

// The email provider. Phase 7 replaces this with the client's service (SendGrid, Postmark, SES …).
// Return { ok: true, providerId } or { ok: false, error }; null means "no provider yet".
async function sendWithProvider() {
  return null;
}

export const emailProviderConnected = () => Boolean(process.env.EMAIL_PROVIDER);

export async function deliverQueued({ limit = 200 } = {}) {
  const rows = await query(`SELECT id, to_email AS toEmail, subject, html FROM email_deliveries WHERE status = 'queued' ORDER BY created_at LIMIT ${Number(limit)}`);
  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    const result = await sendWithProvider(row);
    if (!result) return { sent, failed, waiting: rows.length - sent - failed };
    if (result.ok) {
      sent += 1;
      await query("UPDATE email_deliveries SET status = 'sent', sent_at = NOW(), provider_id = ?, status_reason = NULL, attempts = attempts + 1 WHERE id = ?", [result.providerId ?? null, row.id]);
    } else {
      failed += 1;
      await query("UPDATE email_deliveries SET status = IF(attempts >= 2, 'failed', 'queued'), status_reason = ?, attempts = attempts + 1 WHERE id = ?", [String(result.error).slice(0, 255), row.id]);
    }
  }
  return { sent, failed, waiting: 0 };
}

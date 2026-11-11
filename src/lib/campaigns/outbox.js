import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createId, query } from "@/lib/db";
import { postmarkConfigured, sendPostmark } from "@/lib/email/postmark";

// ── Email outbox ──
// Every customer email (broadcasts, journeys, transactional) is written here first.
// deliverQueued() hands them to Postmark (lib/email/postmark.js); until POSTMARK_SERVER_TOKEN
// is set they stay "queued" and are listed on the Campaigns pages.
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

// Transactional templates go out on Postmark's Transactional stream, Marketing/Lifecycle on Broadcast
export const streamFor = (emailType) => (emailType === "Transactional" ? "transactional" : "broadcast");

// One email for one person. A suppressed Marketing/Lifecycle email is recorded as "skipped".
export async function queueEmail({ source, sourceId = null, enrollmentId = null, template, userId, email, subject, html, suppressed = false }) {
  const id = createId("mail");
  const skip = suppressed && template.emailType !== "Transactional";
  await query(
    "INSERT INTO email_deliveries (id, source, source_id, enrollment_id, template_id, user_id, to_email, subject, html, status, status_reason, stream) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, source, sourceId, enrollmentId, template.id, userId, email, subject.slice(0, 255), html, skip ? "skipped" : "queued", skip ? "Unsubscribed" : WAITING_FOR_PROVIDER, streamFor(template.emailType)]
  );
  return { id, status: skip ? "skipped" : "queued" };
}

export const emailProviderConnected = postmarkConfigured;

// Hands queued emails to Postmark. Each row is claimed first (status "sending") so the job runner
// and an immediate send (password reset, invite) never deliver the same email twice.
// `ids` limits the pass to those emails (used right after a system email is queued).
export async function deliverQueued({ limit = 200, ids = null } = {}) {
  if (!postmarkConfigured()) {
    const [{ waiting }] = await query("SELECT COUNT(*) AS waiting FROM email_deliveries WHERE status = 'queued'");
    return { sent: 0, failed: 0, waiting: Number(waiting) };
  }
  // A send that crashed half-way gets another chance after 10 minutes
  await query("UPDATE email_deliveries SET status = 'queued', locked_at = NULL WHERE status = 'sending' AND locked_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)");
  const filter = ids?.length ? `AND email_deliveries.id IN (${ids.map(() => "?").join(", ")})` : "";
  const rows = await query(
    `SELECT email_deliveries.id, email_deliveries.source, email_deliveries.stream, email_deliveries.to_email AS toEmail, email_deliveries.subject, email_deliveries.html,
      COALESCE(email_deliveries.from_name, campaign_templates.from_name) AS fromName, COALESCE(email_deliveries.reply_to, campaign_templates.reply_to) AS replyTo,
      email_deliveries.cc, email_deliveries.bcc, email_deliveries.track_opens AS trackOpens
     FROM email_deliveries LEFT JOIN campaign_templates ON campaign_templates.id = email_deliveries.template_id
     WHERE email_deliveries.status = 'queued' ${filter} ORDER BY email_deliveries.created_at LIMIT ${Number(limit)}`,
    ids ?? []
  );
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  for (const [index, row] of rows.entries()) {
    const claimed = await query("UPDATE email_deliveries SET status = 'sending', locked_at = NOW() WHERE id = ? AND status = 'queued'", [row.id]);
    if (!claimed.affectedRows) continue;
    const result = await sendPostmark({
      deliveryId: row.id,
      to: row.toEmail,
      subject: row.subject,
      html: row.html,
      fromName: row.fromName,
      replyTo: row.replyTo,
      stream: row.stream,
      tag: row.source,
      cc: row.cc,
      bcc: row.bcc,
      // Broadcast emails carry a one-click unsubscribe header; system emails (reset links, invites) aren't tracked.
      // Emails written in Mail follow the sender's "Track email" switch and keep their links as written.
      unsubscribeUrl: row.stream === "broadcast" ? await unsubscribeUrl(row.toEmail) : null,
      track: row.trackOpens === null || row.trackOpens === undefined ? row.source !== "system" : Boolean(row.trackOpens),
      trackLinks: row.source !== "system" && row.source !== "mail",
    });
    if (result.ok) {
      sent += 1;
      await query("UPDATE email_deliveries SET status = 'sent', sent_at = NOW(), provider_id = ?, status_reason = NULL, locked_at = NULL, attempts = attempts + 1 WHERE id = ?", [result.providerId, row.id]);
    } else if (result.stop) {
      // Postmark unreachable, wrong token or rate limit: put it back and stop this pass
      await query("UPDATE email_deliveries SET status = 'queued', status_reason = ?, locked_at = NULL WHERE id = ?", [result.error, row.id]);
      return { sent, failed, skipped, waiting: rows.length - index, error: result.error };
    } else if (result.inactive) {
      skipped += 1;
      await query("UPDATE email_deliveries SET status = 'skipped', status_reason = ?, locked_at = NULL, attempts = attempts + 1 WHERE id = ?", ["Postmark: this address bounced, complained or unsubscribed before", row.id]);
    } else {
      failed += 1;
      await query("UPDATE email_deliveries SET status = IF(attempts >= 2, 'failed', 'queued'), status_reason = ?, locked_at = NULL, attempts = attempts + 1 WHERE id = ?", [result.error, row.id]);
    }
  }
  return { sent, failed, skipped, waiting: 0 };
}

// ── Postmark (email delivery only) ──
// PitchProX keeps the campaigns, journeys, segments, triggers and templates; Postmark only
// delivers and reports back (webhook → lib/email/events.js). Two message streams:
//   Transactional: invites, password resets, account/payment/subscription notices, receipts
//   Broadcast:     campaigns, journeys, lifecycle, upgrade, usage, marketing
// Settings (.env.local, see DEPLOYMENT.md):
//   POSTMARK_SERVER_TOKEN          server API token. Without it nothing is sent and emails wait in the outbox.
//   EMAIL_FROM_ADDRESS             verified sender, e.g. no-reply@pitchprox.com
//   POSTMARK_TRANSACTIONAL_STREAM  default "outbound"
//   POSTMARK_BROADCAST_STREAM      default "broadcast"
//   POSTMARK_WEBHOOK_SECRET        password in the webhook URL (Basic auth)
//   POSTMARK_API_URL               only for tests (a local stand-in for api.postmarkapp.com)

export const postmarkConfigured = () => Boolean(process.env.POSTMARK_SERVER_TOKEN);

export const streamId = (stream) =>
  stream === "broadcast" ? process.env.POSTMARK_BROADCAST_STREAM || "broadcast" : process.env.POSTMARK_TRANSACTIONAL_STREAM || "outbound";

const apiUrl = () => (process.env.POSTMARK_API_URL || "https://api.postmarkapp.com").replace(/\/$/, "");

// "PitchProX" <no-reply@pitchprox.com>; quotes and line breaks are removed from the name
export function fromHeader(name) {
  const address = process.env.EMAIL_FROM_ADDRESS || "no-reply@pitchprox.com";
  const clean = String(name || "PitchProX").replace(/["\r\n<>]/g, "").trim().slice(0, 100) || "PitchProX";
  return `"${clean}" <${address}>`;
}

// Plain-text part from the HTML, so emails don't look like spam to filters that expect both
export function htmlToText(html) {
  return String(html)
    .replace(/<(style|script|head)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `${label.replace(/<[^>]+>/g, "").trim()} (${href})`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Result:
//   { ok: true, providerId }                     accepted by Postmark
//   { ok: false, error, inactive: true }         recipient is deactivated at Postmark (bounced / complained / unsubscribed)
//   { ok: false, error }                         Postmark refused this email (counts as an attempt)
//   { ok: false, error, stop: true }             service unreachable, wrong token or rate limit: keep it queued, try later
export async function sendPostmark({ deliveryId, to, cc = null, bcc = null, subject, html, fromName, replyTo, stream, tag, unsubscribeUrl, track = true, trackLinks = track }) {
  const body = {
    From: fromHeader(fromName),
    To: to,
    Subject: subject,
    HtmlBody: html,
    TextBody: htmlToText(html) || subject,
    MessageStream: streamId(stream),
    Tag: tag,
    Metadata: { deliveryId },
    TrackOpens: track,
    TrackLinks: track && trackLinks ? "HtmlOnly" : "None",
    ...(replyTo && { ReplyTo: replyTo }),
    ...(cc && { Cc: cc }),
    ...(bcc && { Bcc: bcc }),
    ...(unsubscribeUrl && {
      Headers: [
        { Name: "List-Unsubscribe", Value: `<${unsubscribeUrl}>` },
        { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" },
      ],
    }),
  };
  let response;
  try {
    response = await fetch(`${apiUrl()}/email`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    return { ok: false, stop: true, error: `Email service unreachable: ${error.cause?.code || error.message}` };
  }
  const result = await response.json().catch(() => ({}));
  if (response.ok && !result.ErrorCode) return { ok: true, providerId: result.MessageID ?? null };
  const error = `Postmark ${result.ErrorCode ?? response.status}: ${result.Message || response.statusText}`.slice(0, 255);
  // 401/10: bad or missing token. 429 / 5xx: try again later. 406: inactive recipient.
  if (response.status === 401 || result.ErrorCode === 10 || response.status === 429 || response.status >= 500) return { ok: false, stop: true, error };
  if (result.ErrorCode === 406) return { ok: false, inactive: true, error };
  return { ok: false, error };
}

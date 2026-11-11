import { timingSafeEqual } from "node:crypto";
import { createId, query } from "@/lib/db";
import { suppress } from "@/lib/campaigns/outbox";

// ── Postmark webhook events ──
// Postmark posts one JSON event per request to /api/v1/public/postmark/webhook. Each one is kept
// in email_events, and the matching outbox row (found by Metadata.deliveryId, else MessageID) is updated:
//   Delivery           delivered_at
//   Bounce             hard bounce → bounced_at + suppressed (no more broadcasts); soft bounce → noted only
//   SpamComplaint      complained_at + suppressed
//   Open / Click       opened_at / clicked_at (journeys' "Email Opened / Clicked" conditions read these)
//   SubscriptionChange unsubscribe or reactivation done in Postmark → suppression list follows it

// Bounce types that mean "this address won't work": stop broadcasting to it
const HARD_BOUNCES = new Set(["HardBounce", "BadEmailAddress", "ManuallyDeactivated", "SpamNotification"]);
const SUPPRESSION_REASON = { HardBounce: "bounced", SpamComplaint: "spam", ManualSuppression: "unsubscribed" };

// Webhook URL: https://postmark:<POSTMARK_WEBHOOK_SECRET>@app.pitchprox.com/api/v1/public/postmark/webhook
// Returns "ok", "unconfigured" or "denied"
export function checkWebhookAuth(request) {
  const secret = process.env.POSTMARK_WEBHOOK_SECRET;
  if (!secret) return "unconfigured";
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return "denied";
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const password = Buffer.from(decoded.slice(decoded.indexOf(":") + 1));
  const expected = Buffer.from(secret);
  return password.length === expected.length && timingSafeEqual(password, expected) ? "ok" : "denied";
}

const when = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

async function findDelivery(event) {
  const deliveryId = event.Metadata?.deliveryId;
  if (typeof deliveryId === "string") {
    const [row] = await query("SELECT id, to_email AS email FROM email_deliveries WHERE id = ?", [deliveryId]);
    if (row) return row;
  }
  if (typeof event.MessageID === "string") {
    const [row] = await query("SELECT id, to_email AS email FROM email_deliveries WHERE provider_id = ?", [event.MessageID]);
    if (row) return row;
  }
  return null;
}

export async function recordPostmarkEvent(event) {
  const type = typeof event?.RecordType === "string" ? event.RecordType.slice(0, 30) : null;
  if (!type) return { recorded: false };
  const delivery = await findDelivery(event);
  const email = String(event.Recipient || event.Email || delivery?.email || "").toLowerCase().slice(0, 255) || null;
  const at = when(event.DeliveredAt || event.BouncedAt || event.ReceivedAt || event.ChangedAt);
  const detail = { type: event.Type, description: event.Description, details: typeof event.Details === "string" ? event.Details.slice(0, 500) : undefined, link: event.OriginalLink, suppress: event.SuppressSending, reason: event.SuppressionReason, stream: event.MessageStream };
  await query("INSERT INTO email_events (id, delivery_id, record_type, email, provider_id, detail, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    createId("mev"), delivery?.id ?? null, type, email, typeof event.MessageID === "string" ? event.MessageID.slice(0, 255) : null, JSON.stringify(detail), at,
  ]);

  switch (type) {
    case "Delivery":
      if (delivery) await query("UPDATE email_deliveries SET delivered_at = COALESCE(delivered_at, ?), provider_status = 'Delivered' WHERE id = ?", [at, delivery.id]);
      break;
    case "Bounce": {
      const hard = event.Inactive === true || HARD_BOUNCES.has(event.Type);
      const note = `${hard ? "Bounced" : "Soft bounce"}: ${event.Description || event.Type || "no details"}`.slice(0, 255);
      if (delivery) await query(`UPDATE email_deliveries SET provider_status = ?${hard ? ", bounced_at = COALESCE(bounced_at, ?)" : ""} WHERE id = ?`, hard ? [note, at, delivery.id] : [note, delivery.id]);
      if (hard && email) await suppress(email, "bounced");
      break;
    }
    case "SpamComplaint":
      if (delivery) await query("UPDATE email_deliveries SET complained_at = COALESCE(complained_at, ?), provider_status = 'Marked as spam' WHERE id = ?", [at, delivery.id]);
      if (email) await suppress(email, "spam");
      break;
    case "Open":
      if (delivery) await query("UPDATE email_deliveries SET opened_at = COALESCE(opened_at, ?) WHERE id = ?", [at, delivery.id]);
      break;
    case "Click":
      // A click also proves the email was opened (images may be blocked)
      if (delivery) await query("UPDATE email_deliveries SET clicked_at = COALESCE(clicked_at, ?), opened_at = COALESCE(opened_at, ?) WHERE id = ?", [at, at, delivery.id]);
      break;
    case "SubscriptionChange":
      if (!email) break;
      if (event.SuppressSending === true) await suppress(email, SUPPRESSION_REASON[event.SuppressionReason] ?? "unsubscribed");
      else if (event.SuppressSending === false) await query("DELETE FROM email_suppressions WHERE email = ?", [email]);
      break;
    default:
      break;
  }
  return { recorded: true, matched: Boolean(delivery) };
}

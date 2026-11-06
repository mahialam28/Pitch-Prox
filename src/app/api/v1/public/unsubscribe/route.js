import { suppress, verifyUnsubscribe } from "@/lib/campaigns/outbox";

export const runtime = "nodejs";

const page = (title, text) =>
  new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="font-family:Arial,sans-serif;background:#f4f5f7;margin:0"><div style="max-width:480px;margin:80px auto;background:#fff;border-radius:16px;padding:32px;text-align:center"><h1 style="font-size:20px;color:#101828">${title}</h1><p style="color:#475467;line-height:1.6">${text}</p></div></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });

// Link at the bottom of Marketing and Lifecycle emails. Transactional emails (receipts, payment problems) still arrive.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = await verifyUnsubscribe(searchParams.get("e"), searchParams.get("s"));
  if (!email) return page("Link not valid", "This unsubscribe link isn't valid. Please use the link from your most recent email.");
  await suppress(email);
  return page("You're unsubscribed", "You won't receive PitchProX marketing or product emails any more. Account and billing emails will still be sent.");
}

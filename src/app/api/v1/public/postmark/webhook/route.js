import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { checkWebhookAuth, recordPostmarkEvent } from "@/lib/email/events";

export const runtime = "nodejs";

// Postmark → PitchProX: delivery, bounce, spam complaint, open, click and subscription change events.
// Set up in Postmark (each stream → Webhooks) with Basic auth: user "postmark", password POSTMARK_WEBHOOK_SECRET.
export const POST = withApi(async (request) => {
  const auth = checkWebhookAuth(request);
  if (auth === "unconfigured") return NextResponse.json({ error: "The Postmark webhook isn't set up yet." }, { status: 503 });
  if (auth === "denied") return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const event = await request.json().catch(() => null);
  if (!event || typeof event !== "object") return NextResponse.json({ error: "Expected a JSON event." }, { status: 400 });
  return NextResponse.json(await recordPostmarkEvent(event));
});

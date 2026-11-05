import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { replyAsAgent, requireSupportAgent } from "@/lib/support-staff";

export const runtime = "nodejs";

// multipart/form-data: body, optional file — the customer sees it as a Support reply
export const POST = withApi(async (request, { params }) => {
  const user = await requireSupportAgent();
  const { ticketId } = await params;
  return NextResponse.json({ ticket: await replyAsAgent(user, ticketId, await readForm(request)) }, { status: 201 });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { escalateTicket, requireSupportAgent } from "@/lib/support-staff";

export const runtime = "nodejs";

// { assignedTo, priority, reason }
export const POST = withApi(async (request, { params }) => {
  const user = await requireSupportAgent();
  const { ticketId } = await params;
  return NextResponse.json({ ticket: await escalateTicket(user, ticketId, await readJson(request)) });
});

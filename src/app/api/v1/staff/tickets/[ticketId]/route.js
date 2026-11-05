import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { getStaffTicket, requireSupportAgent, updateStaffTicket } from "@/lib/support-staff";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  await requireSupportAgent();
  const { ticketId } = await params;
  return NextResponse.json({ ticket: await getStaffTicket(ticketId) });
});

// { assignedTo?, priority?, status?, note? }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireSupportAgent();
  const { ticketId } = await params;
  return NextResponse.json({ ticket: await updateStaffTicket(user, ticketId, await readJson(request)) });
});

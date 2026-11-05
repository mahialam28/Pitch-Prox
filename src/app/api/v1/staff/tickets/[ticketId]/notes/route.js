import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { addInternalNote, requireSupportAgent } from "@/lib/support-staff";

export const runtime = "nodejs";

// { body } — internal only, never shown to the customer
export const POST = withApi(async (request, { params }) => {
  const user = await requireSupportAgent();
  const { ticketId } = await params;
  return NextResponse.json({ ticket: await addInternalNote(user, ticketId, (await readJson(request)).body) }, { status: 201 });
});

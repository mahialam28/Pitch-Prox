import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { assertCanWrite } from "@/lib/permissions";
import { requireLead } from "@/lib/lead-activity";
import { setPhoneStatus } from "@/lib/phones";

export const runtime = "nodejs";

// One number of a lead: { status?, called? } — e.g. "bad" after a call; the lead's other numbers stay callable
export const PATCH = withApi(async (request, { params }) => {
  const { user, lead } = await requireLead(params);
  assertCanWrite(user);
  const { phoneId } = await params;
  const body = await readJson(request);
  return NextResponse.json({ phones: await setPhoneStatus(user, "lead", lead.id, phoneId, { status: body.status, called: body.called === true }) });
});

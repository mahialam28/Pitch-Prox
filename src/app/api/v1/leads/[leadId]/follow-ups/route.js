import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireLead, setLeadFollowUp } from "@/lib/lead-activity";

export const runtime = "nodejs";

// Body: { followUpAt: ISO date-time in the future }
export const POST = withApi(async (request, { params }) => {
  const { user, lead } = await requireLead(params);
  return NextResponse.json({ lead: await setLeadFollowUp(user, lead.id, (await readJson(request)).followUpAt) });
});

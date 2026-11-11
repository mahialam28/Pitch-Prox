import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { requestIncidentInfo } from "@/lib/compliance/incidents";

export const runtime = "nodejs";

// { message } — emailed to the reporter (waits in the outbox until email is connected)
export const POST = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { incidentId } = await params;
  const { message } = await readJson(request);
  return NextResponse.json(await requestIncidentInfo(user, incidentId, message));
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { addIncidentNote } from "@/lib/compliance/incidents";

export const runtime = "nodejs";

// { note } — added to the incident's timeline
export const POST = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { incidentId } = await params;
  const { note } = await readJson(request);
  return NextResponse.json(await addIncidentNote(user, incidentId, note));
});

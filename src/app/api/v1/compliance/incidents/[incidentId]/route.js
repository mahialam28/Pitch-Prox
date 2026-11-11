import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";
import { getIncident, updateIncident } from "@/lib/compliance/incidents";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const user = await requireCompliance();
  const { incidentId } = await params;
  return NextResponse.json(await getIncident(user, incidentId));
});

// { title?, description?, category?, severity?, affectedSystems?, assignedTo?, relatedTicket? }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { incidentId } = await params;
  return NextResponse.json(await updateIncident(user, incidentId, await readJson(request)));
});

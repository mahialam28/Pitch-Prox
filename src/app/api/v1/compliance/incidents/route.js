import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";
import { listIncidents, reportIncident } from "@/lib/compliance/incidents";

export const runtime = "nodejs";

// Incident Management page: incidents, KPI cards, status summary, top categories, managers
export const GET = withApi(async () => NextResponse.json(await listIncidents(await requireCompliance())));

// Report New Incident (multipart): title, category, severity, occurredAt, description,
// affectedSystems, relatedTicket, assignedTo, file. Starts Open.
export const POST = withApi(async (request) => {
  const user = await requireComplianceWriter();
  return NextResponse.json(await reportIncident(user, await readForm(request)), { status: 201 });
});

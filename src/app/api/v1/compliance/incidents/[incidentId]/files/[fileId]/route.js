import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";
import { incidentFile, removeIncidentFile } from "@/lib/compliance/incidents";

export const runtime = "nodejs";

// Download an evidence file
export const GET = withApi(async (_request, { params }) => {
  await requireCompliance();
  const { incidentId, fileId } = await params;
  const file = await incidentFile(incidentId, fileId);
  return new Response(file.bytes, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});

// Super Admin only
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireComplianceWriter();
  const { incidentId, fileId } = await params;
  return NextResponse.json(await removeIncidentFile(user, incidentId, fileId));
});

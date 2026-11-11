import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { addIncidentFiles } from "@/lib/compliance/incidents";

export const runtime = "nodejs";

// multipart: one or more `files`
export const POST = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { incidentId } = await params;
  const form = await readForm(request);
  return NextResponse.json(await addIncidentFiles(user, incidentId, form.getAll("files")), { status: 201 });
});

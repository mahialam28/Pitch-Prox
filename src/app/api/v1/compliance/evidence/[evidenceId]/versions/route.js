import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { uploadEvidenceVersion } from "@/lib/compliance/evidence";

export const runtime = "nodejs";

// Upload New Version (multipart): file, note?, expires?, expiryDate? — the old file is kept
export const POST = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { evidenceId } = await params;
  return NextResponse.json(await uploadEvidenceVersion(user, evidenceId, await readForm(request)), { status: 201 });
});

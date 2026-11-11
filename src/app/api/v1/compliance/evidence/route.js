import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";
import { listEvidence, uploadEvidence } from "@/lib/compliance/evidence";

export const runtime = "nodejs";

// Evidence Repository: items, counts (archived left out), by type, recent uploads, controls, owners
export const GET = withApi(async () => NextResponse.json(await listEvidence(await requireCompliance())));

// Upload Evidence (multipart): name, description, criteria (JSON list), controls (JSON list),
// ownerId, period, expires ("never" | "on"), expiryDate, file, action ("submit" | "draft")
export const POST = withApi(async (request) => {
  const user = await requireComplianceWriter();
  return NextResponse.json(await uploadEvidence(user, await readForm(request)), { status: 201 });
});

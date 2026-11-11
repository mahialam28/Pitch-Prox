import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";
import { createTraining, listTrainings } from "@/lib/compliance/training";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  await requireCompliance();
  return NextResponse.json({ results: await listTrainings() });
});

// Create Training: { title, categoryId, description, materialIds: [], minutes, requirement,
// issueCertificate, certificateValidity, certificateMonths }
export const POST = withApi(async (request) => {
  const user = await requireComplianceWriter();
  return NextResponse.json({ training: await createTraining(user, await readJson(request)) }, { status: 201 });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";
import { deleteEvidence, getEvidence, updateEvidence } from "@/lib/compliance/evidence";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const user = await requireCompliance();
  const { evidenceId } = await params;
  return NextResponse.json(await getEvidence(user, evidenceId));
});

// Edit (Draft / Needs Changes): { name, description, criteria, controls, ownerId, period, expires, expiryDate }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { evidenceId } = await params;
  return NextResponse.json(await updateEvidence(user, evidenceId, await readJson(request)));
});

// Drafts only
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireComplianceWriter();
  const { evidenceId } = await params;
  return NextResponse.json(await deleteEvidence(user, evidenceId));
});

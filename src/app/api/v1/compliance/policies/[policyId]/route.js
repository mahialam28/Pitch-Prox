import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { getPolicy, readPolicyInput, removePolicy, requireCompliance, requireComplianceWriter, updatePolicy } from "@/lib/compliance/policies";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const user = await requireCompliance();
  const { policyId } = await params;
  return NextResponse.json(await getPolicy(user, policyId));
});

// Edit Document: updates the version being prepared, starts a new version (new number or file),
// or changes the details only. JSON or multipart; action: "draft" | "submit" (optional)
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { policyId } = await params;
  return NextResponse.json(await updatePolicy(user, policyId, await readPolicyInput(request)));
});

// Never approved → deleted; approved → archived (Super Admin)
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireComplianceWriter();
  const { policyId } = await params;
  return NextResponse.json(await removePolicy(user, policyId));
});

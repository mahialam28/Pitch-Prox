import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { createPolicy, listPolicies, readPolicyInput, requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// Policy Documents page: every policy, KPI cards and the Pending Approvals list
export const GET = withApi(async () => NextResponse.json(await listPolicies(await requireCompliance())));

// Upload Document. JSON or multipart (file: PDF / DOCX). action: "draft" | "submit"
export const POST = withApi(async (request) => {
  const user = await requireComplianceWriter();
  return NextResponse.json(await createPolicy(user, await readPolicyInput(request)), { status: 201 });
});

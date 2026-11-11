import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireComplianceWriter, unarchivePolicy } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// Bring an archived policy back (Super Admin)
export const POST = withApi(async (_request, { params }) => {
  const user = await requireComplianceWriter();
  const { policyId } = await params;
  return NextResponse.json(await unarchivePolicy(user, policyId));
});

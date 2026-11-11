import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCompliance } from "@/lib/compliance/policies";
import { assignableEmployees } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Employees for Bulk Assign (with their Training department)
export const GET = withApi(async () => {
  await requireCompliance();
  return NextResponse.json({ results: await assignableEmployees() });
});

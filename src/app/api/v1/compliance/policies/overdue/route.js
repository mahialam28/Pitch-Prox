import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { overdueEmployees, requireCompliance } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// Employees past the deadline to sign one or more policies
export const GET = withApi(async () => {
  await requireCompliance();
  return NextResponse.json({ results: await overdueEmployees() });
});

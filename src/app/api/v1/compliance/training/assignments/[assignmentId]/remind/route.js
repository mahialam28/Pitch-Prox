import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { remindAssignment } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Queue a reminder email to the employee
export const POST = withApi(async (_request, { params }) => {
  const user = await requireComplianceWriter();
  const { assignmentId } = await params;
  return NextResponse.json(await remindAssignment(user, assignmentId));
});

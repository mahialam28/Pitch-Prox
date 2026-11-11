import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { completeMyTraining } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Mark the Training complete once every material has been opened (issues the certificate if set)
export const POST = withApi(async (_request, { params }) => {
  const user = await requireStaff();
  const { assignmentId } = await params;
  return NextResponse.json(await completeMyTraining(user, assignmentId));
});

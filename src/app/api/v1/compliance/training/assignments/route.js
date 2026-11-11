import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { assignTraining } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Bulk Assign: { courseIds: [], userIds: [], dueDate, requirement, notify, allowReassign }
export const POST = withApi(async (request) => {
  const user = await requireComplianceWriter();
  return NextResponse.json(await assignTraining(user, await readJson(request)), { status: 201 });
});

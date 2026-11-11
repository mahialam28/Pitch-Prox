import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { removeAssignment, updateAssignment } from "@/lib/compliance/training";

export const runtime = "nodejs";

// { dueDate?, requirement? } for an open assignment
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { assignmentId } = await params;
  return NextResponse.json(await updateAssignment(user, assignmentId, await readJson(request)));
});

// Remove an open assignment (completions stay on record)
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireComplianceWriter();
  const { assignmentId } = await params;
  return NextResponse.json(await removeAssignment(user, assignmentId));
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { archiveTraining, updateTraining } from "@/lib/compliance/training";

export const runtime = "nodejs";

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { courseId } = await params;
  return NextResponse.json({ training: await updateTraining(user, courseId, await readJson(request)) });
});

// Retire the Training: open assignments are removed, completions are kept
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireComplianceWriter();
  const { courseId } = await params;
  return NextResponse.json(await archiveTraining(user, courseId));
});

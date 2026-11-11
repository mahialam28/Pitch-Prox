import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { myTraining, viewMaterial } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Record that a video link was opened
export const POST = withApi(async (_request, { params }) => {
  const user = await requireStaff();
  const { assignmentId, materialId } = await params;
  await viewMaterial(user, assignmentId, materialId);
  return NextResponse.json(await myTraining(user));
});

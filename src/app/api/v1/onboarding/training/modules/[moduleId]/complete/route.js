import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireOnboarding } from "@/lib/permissions";
import { completeTrainingModule } from "@/lib/onboarding";

export const runtime = "nodejs";
export const POST = withApi(async (request, { params }) => {
  const user = await requireOnboarding();
  const { moduleId } = await params;
  return NextResponse.json(await completeTrainingModule(user, moduleId));
});

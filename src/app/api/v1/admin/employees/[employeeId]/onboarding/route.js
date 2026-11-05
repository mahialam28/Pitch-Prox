import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { onboardingProgressFor } from "@/lib/onboarding";

export const runtime = "nodejs";
export const GET = withApi(async (request, { params }) => {
  await requireSection("compliance");
  const { employeeId } = await params;
  return NextResponse.json(await onboardingProgressFor(employeeId));
});

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireOnboarding } from "@/lib/permissions";
import { getOnboardingState } from "@/lib/onboarding";

export const runtime = "nodejs";
export const GET = withApi(async () => NextResponse.json(await getOnboardingState(await requireOnboarding())));

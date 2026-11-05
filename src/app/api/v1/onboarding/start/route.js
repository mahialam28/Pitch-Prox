import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireOnboarding } from "@/lib/permissions";
import { startOnboarding } from "@/lib/onboarding";

export const runtime = "nodejs";

// Welcome step "Get Started"
export const POST = withApi(async () => NextResponse.json(await startOnboarding(await requireOnboarding())));

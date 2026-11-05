import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireOnboarding } from "@/lib/permissions";
import { setOnboardingPassword } from "@/lib/onboarding";

export const runtime = "nodejs";

// { password, confirm }
export const POST = withApi(async (request) => {
  const user = await requireOnboarding();
  return NextResponse.json(await setOnboardingPassword(user, await readJson(request)));
});

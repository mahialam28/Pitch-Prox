import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireOnboarding } from "@/lib/permissions";
import { completeVoiceCalibration } from "@/lib/onboarding";

export const runtime = "nodejs";

// { durationSeconds? } — sales reps only
export const POST = withApi(async (request) => {
  const user = await requireOnboarding();
  const body = await readJson(request).catch(() => ({}));
  return NextResponse.json(await completeVoiceCalibration(user, body));
});

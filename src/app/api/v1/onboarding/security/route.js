import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireOnboarding } from "@/lib/permissions";
import { setMfaMethod } from "@/lib/onboarding";

export const runtime = "nodejs";

// { mfaMethod: "sms" | "mail" }
export const PUT = withApi(async (request) => {
  const user = await requireOnboarding();
  const { mfaMethod } = await readJson(request);
  return NextResponse.json(await setMfaMethod(user, mfaMethod));
});

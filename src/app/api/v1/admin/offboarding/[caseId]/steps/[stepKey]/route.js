import { NextResponse } from "next/server";
import { ApiError, readJson, withApi } from "@/lib/api";
import { assertCanWrite, requireSection } from "@/lib/permissions";
import { setOffboardingStep } from "@/lib/offboarding";

export const runtime = "nodejs";

// { done: true | false }
export const PUT = withApi(async (request, { params }) => {
  const user = await requireSection("compliance");
  assertCanWrite(user);
  const { caseId, stepKey } = await params;
  const { done } = await readJson(request);
  if (typeof done !== "boolean") throw new ApiError("done must be true or false.");
  return NextResponse.json({ case: await setOffboardingStep(user, caseId, stepKey, done) });
});

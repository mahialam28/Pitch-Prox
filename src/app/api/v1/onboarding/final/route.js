import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireOnboarding } from "@/lib/permissions";
import { signFinalAcknowledgment } from "@/lib/onboarding";

export const runtime = "nodejs";

// { signature, employeeId?, statements: [true × 5] }
export const POST = withApi(async (request) => {
  const user = await requireOnboarding();
  return NextResponse.json(await signFinalAcknowledgment(user, await readJson(request)));
});

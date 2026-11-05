import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireOnboarding } from "@/lib/permissions";
import { acknowledgePolicy } from "@/lib/onboarding";

export const runtime = "nodejs";

// { signature: "<full name>" }
export const POST = withApi(async (request, { params }) => {
  const user = await requireOnboarding();
  const { policyId } = await params;
  const { signature } = await readJson(request);
  return NextResponse.json(await acknowledgePolicy(user, policyId, signature));
});

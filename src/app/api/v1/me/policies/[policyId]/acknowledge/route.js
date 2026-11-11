import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { acknowledgeMyPolicy } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// { signature: "<full name>" }
export const POST = withApi(async (request, { params }) => {
  const user = await requireStaff();
  const { policyId } = await params;
  const { signature } = await readJson(request);
  return NextResponse.json(await acknowledgeMyPolicy(user, policyId, signature));
});

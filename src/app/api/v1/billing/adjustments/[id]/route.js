import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { decideAdjustment, requireBillingAccess } from "@/lib/accounts";

export const runtime = "nodejs";

// Super Admin: { decision: "approve" | "reject", note? }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireBillingAccess();
  const { decision, note } = await readJson(request);
  return NextResponse.json(await decideAdjustment(user, (await params).id, { approve: decision === "approve", note }));
});

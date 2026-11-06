import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, previewChange } from "@/lib/accounts";

export const runtime = "nodejs";

// What a plan or billing-cycle change costs, before confirming: { planId, billingCycle, when }
export const POST = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId);
  return NextResponse.json(await previewChange(context, await readJson(request)));
});

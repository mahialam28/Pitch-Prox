import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, changeSubscription, getAccountDetail } from "@/lib/accounts";

export const runtime = "nodejs";

// { planId, billingCycle, when: "now" | "renewal" }
export const PATCH = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  const change = await changeSubscription(context, await readJson(request));
  return NextResponse.json({ change, account: await getAccountDetail(context) });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, cancelSubscription, getAccountDetail } from "@/lib/accounts";

export const runtime = "nodejs";

// Cancel at the end of the period, or { undo: true } to keep it
export const POST = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  await cancelSubscription(context, await readJson(request));
  return NextResponse.json(await getAccountDetail(context));
});

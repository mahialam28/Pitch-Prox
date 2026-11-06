import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireBillingAccess, reverseAdjustment } from "@/lib/accounts";

export const runtime = "nodejs";

// Super Admin: { reason } adds an opposite entry; the original stays in the ledger
export const POST = withApi(async (request, { params }) => {
  const user = await requireBillingAccess();
  return NextResponse.json(await reverseAdjustment(user, (await params).id, await readJson(request)), { status: 201 });
});

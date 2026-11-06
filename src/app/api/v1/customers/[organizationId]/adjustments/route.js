import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, requestAdjustment } from "@/lib/accounts";

export const runtime = "nodejs";

// { kind: calls | reports | credit | discount | refund, quantity? | amount?, applyTo?, invoice?, reason }
export const POST = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  return NextResponse.json(await requestAdjustment(context, await readJson(request)), { status: 201 });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { listCalls, startCall } from "@/lib/calls";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// GET: my finished calls (?mode=live|practice). POST: start a call → { call, token, serviceUrl }.
// Body: { mode: "live"|"practice", scriptId?, roleplay?, contactKind?, contactId?, phoneId?, leadName?, phoneNumber?, leadType? }
export const GET = withApi(async (request) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const params = new URL(request.url).searchParams;
  return NextResponse.json({ results: await listCalls(user, { mode: params.get("mode"), limit: params.get("limit") }) });
});

export const POST = withApi(async (request) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  return NextResponse.json(await startCall(user, await readJson(request)), { status: 201 });
});

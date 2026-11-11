import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getCall, setCallDisposition } from "@/lib/calls";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// One of my calls with its summary and transcript (the account owner can open their team's calls)
export const GET = withApi(async (request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const { callId } = await params;
  return NextResponse.json({ call: await getCall(user, callId) });
});

// { disposition }: the call's outcome (Appointment Set, Follow-Up Required, …) or null
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const { callId } = await params;
  const body = await readJson(request);
  return NextResponse.json({ call: await setCallDisposition(user, callId, body.disposition ?? null) });
});

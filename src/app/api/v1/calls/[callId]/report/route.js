import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getCallReport } from "@/lib/calls";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// { call, report, locked, usage }: report.detailed is null until a live call's report is unlocked
export const GET = withApi(async (request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const { callId } = await params;
  return NextResponse.json(await getCallReport(user, callId));
});

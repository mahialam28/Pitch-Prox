import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { unlockCallReport } from "@/lib/calls";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// Unlock a live call's detailed report: uses one of the plan's reports (402 when none are left)
export const POST = withApi(async (request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const { callId } = await params;
  return NextResponse.json(await unlockCallReport(user, callId));
});

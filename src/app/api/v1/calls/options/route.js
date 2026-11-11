import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { callUsage, reportUsage, telephonyConfigured } from "@/lib/calls";
import { practiceScriptOptions } from "@/lib/ai/practice-scripts";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// What the call setup screen can offer: live calling (once phone calls are connected), the
// practice scenarios, and this month's call usage
export const GET = withApi(async () => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  return NextResponse.json({ liveAvailable: telephonyConfigured(), practiceScripts: practiceScriptOptions(), usage: await callUsage(user.organizationId), reportUsage: await reportUsage(user.organizationId) });
});

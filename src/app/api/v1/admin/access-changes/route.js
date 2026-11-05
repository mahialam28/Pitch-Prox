import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { listAuditLogs } from "@/lib/audit";
import { requireSection } from "@/lib/permissions";

export const runtime = "nodejs";

const ACCESS_ACTIONS = ["staff.invited", "staff.invite_resent", "staff.invite_accepted", "staff.updated", "onboarding.completed", "offboarding.started", "offboarding.completed", "security.mfa_selected"];

// "Recent Access Changes" on Access Records
export const GET = withApi(async () => {
  await requireSection("compliance");
  return NextResponse.json({ results: await listAuditLogs({ actions: ACCESS_ACTIONS, limit: 10 }) });
});

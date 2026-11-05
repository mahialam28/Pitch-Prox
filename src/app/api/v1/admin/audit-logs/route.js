import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { listAuditLogs } from "@/lib/audit";
import { requireSection } from "@/lib/permissions";

export const runtime = "nodejs";

// Latest audit entries; ?entityType=&entityId=&limit= (full filtering comes with the Audit Logs page in Phase 6)
export const GET = withApi(async (request) => {
  await requireSection("compliance");
  const { searchParams } = new URL(request.url);
  return NextResponse.json({
    results: await listAuditLogs({ entityType: searchParams.get("entityType") || null, entityId: searchParams.get("entityId") || null, limit: searchParams.get("limit") }),
  });
});

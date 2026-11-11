import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { auditFilterOptions, auditFilters, auditStats, listAuditEvents } from "@/lib/compliance/audit-logs";

export const runtime = "nodejs";

// Audit Logs page: one page of events for the filters, the KPI cards and the filter choices.
// ?category=&action=&entity=&user=&ip=&search=&from=YYYY-MM-DD&to=YYYY-MM-DD&page=&pageSize=
export const GET = withApi(async (request) => {
  await requireSection("compliance");
  const params = new URL(request.url).searchParams;
  const [list, stats, options] = await Promise.all([
    listAuditEvents(auditFilters(params), { page: params.get("page"), pageSize: params.get("pageSize") }),
    auditStats(),
    auditFilterOptions(),
  ]);
  return NextResponse.json({ ...list, stats, options });
});

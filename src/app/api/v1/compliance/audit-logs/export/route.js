import { withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { auditFilters, exportAuditLogs } from "@/lib/compliance/audit-logs";

export const runtime = "nodejs";

// Download the audit log as CSV or JSON. Takes the page's filters plus
// ?range=filters|7d|30d|90d|year&format=csv|json&context=1. The export itself is audited.
export const GET = withApi(async (request) => {
  const user = await requireSection("compliance");
  const params = new URL(request.url).searchParams;
  const file = await exportAuditLogs(user, auditFilters(params), {
    range: params.get("range") || "filters",
    format: params.get("format") || "csv",
    includeContext: params.get("context") === "1",
  });
  return new Response(file.body, { headers: { "Content-Type": file.type, "Content-Disposition": `attachment; filename="${file.filename}"`, "Cache-Control": "no-store" } });
});

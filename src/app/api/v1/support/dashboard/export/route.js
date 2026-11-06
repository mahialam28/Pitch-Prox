import { withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { supportReportCsv } from "@/lib/support-dashboard";

export const runtime = "nodejs";

// Tickets created in the range as a CSV download: ?range=7d|30d
export const GET = withApi(async (request) => {
  await requireSection("support");
  const range = new URL(request.url).searchParams.get("range") || "7d";
  const csv = await supportReportCsv({ range });
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="support-report-${range}.csv"` } });
});

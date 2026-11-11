import { withApi } from "@/lib/api";
import { requireCompliance } from "@/lib/compliance/policies";
import { gapsCsv } from "@/lib/compliance/soc2";

export const runtime = "nodejs";

// Open Gaps as a CSV download
export const GET = withApi(async () => {
  const user = await requireCompliance();
  return new Response(await gapsCsv(user), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="soc2-gaps-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
});

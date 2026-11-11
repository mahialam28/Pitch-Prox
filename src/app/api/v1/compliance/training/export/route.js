import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCompliance } from "@/lib/compliance/policies";
import { trainingReport } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Training Assignment Report as CSV: ?training=&status=&department=&from=&to=&fields=A,B
// ?count=1 returns { rows } for the Export Summary instead of the file.
export const GET = withApi(async (request) => {
  const user = await requireCompliance();
  const params = new URL(request.url).searchParams;
  const report = await trainingReport(user, params);
  if (params.get("count") === "1") return NextResponse.json({ rows: report.rows });
  return new Response(report.csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${report.filename}"`, "Cache-Control": "no-store" } });
});

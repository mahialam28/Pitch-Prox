import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { businessAnalytics } from "@/lib/business-analytics";

export const runtime = "nodejs";

// Performance Analytics (Super Admin): revenue, growth, churn, risk, reps and alerts
export const GET = withApi(async () => {
  await requireSection("performance");
  return NextResponse.json(await businessAnalytics());
});

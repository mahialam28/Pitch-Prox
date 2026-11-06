import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireTeamSection, teamOverview } from "@/lib/sales-team";

export const runtime = "nodejs";

// Sales Reps page: team stats, every rep with this month's numbers, tiers, alerts. ?month=YYYY-MM
export const GET = withApi(async (request) => {
  await requireTeamSection();
  const month = new URL(request.url).searchParams.get("month") || undefined;
  return NextResponse.json(await teamOverview({ month }));
});

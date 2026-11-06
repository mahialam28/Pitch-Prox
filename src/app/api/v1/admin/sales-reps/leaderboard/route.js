import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { leaderboard, requireTeamSection } from "@/lib/sales-team";

export const runtime = "nodejs";

// Sales Leaderboard: ?period=month|quarter|year
export const GET = withApi(async (request) => {
  await requireTeamSection();
  return NextResponse.json(await leaderboard({ period: new URL(request.url).searchParams.get("period") || "month" }));
});

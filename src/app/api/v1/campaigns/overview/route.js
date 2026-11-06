import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { campaignOverview } from "@/lib/campaigns/overview";

export const runtime = "nodejs";

// Overview / Analytics numbers, recent activity, delivery issues and the last job run
export const GET = withApi(async () => {
  await requireCampaigns();
  return NextResponse.json(await campaignOverview());
});

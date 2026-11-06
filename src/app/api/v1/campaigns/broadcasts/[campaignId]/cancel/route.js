import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { cancelCampaign } from "@/lib/campaigns/broadcasts";

export const runtime = "nodejs";

export const POST = withApi(async (_request, { params }) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ campaign: await cancelCampaign(user, (await params).campaignId) });
});

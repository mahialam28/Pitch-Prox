import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { getCampaign, updateCampaign } from "@/lib/campaigns/broadcasts";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  await requireCampaigns();
  return NextResponse.json({ campaign: await getCampaign((await params).campaignId) });
});

// Scheduled campaigns only
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ campaign: await updateCampaign(user, (await params).campaignId, await readJson(request)) });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { getJourney, updateJourney } from "@/lib/campaigns/journeys";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  await requireCampaigns();
  return NextResponse.json({ journey: await getJourney((await params).journeyId) });
});

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ journey: await updateJourney(user, (await params).journeyId, await readJson(request)) });
});

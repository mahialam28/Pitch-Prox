import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { setJourneyStatus } from "@/lib/campaigns/journeys";

export const runtime = "nodejs";

// { action: "publish" | "pause" | "resume" | "archive" }
export const POST = withApi(async (request, { params }) => {
  const user = await requireCampaigns({ write: true });
  const { action } = await readJson(request);
  return NextResponse.json(await setJourneyStatus(user, (await params).journeyId, action));
});

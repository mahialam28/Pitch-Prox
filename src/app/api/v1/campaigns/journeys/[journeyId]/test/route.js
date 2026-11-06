import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { testJourney } from "@/lib/campaigns/journeys";

export const runtime = "nodejs";

// { email, userId? } — queue every email step to a staff address, marked [Test]
export const POST = withApi(async (request, { params }) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json(await testJourney(user, (await params).journeyId, await readJson(request)));
});

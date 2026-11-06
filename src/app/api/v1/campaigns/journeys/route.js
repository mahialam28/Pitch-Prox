import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { createJourney, listJourneys } from "@/lib/campaigns/journeys";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  await requireCampaigns();
  return NextResponse.json({ results: await listJourneys() });
});

// Saved as a draft: { name, triggerConfig, audience, reentry, exitConditions, goal, steps }
export const POST = withApi(async (request) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ journey: await createJourney(user, await readJson(request)) }, { status: 201 });
});

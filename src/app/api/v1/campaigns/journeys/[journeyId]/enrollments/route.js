import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { journeyEnrollments } from "@/lib/campaigns/journeys";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  await requireCampaigns();
  return NextResponse.json({ results: await journeyEnrollments((await params).journeyId) });
});

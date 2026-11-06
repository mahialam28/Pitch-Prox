import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { createSegment, requireCampaigns, segmentsOverview } from "@/lib/campaigns/segments";

export const runtime = "nodejs";

// Every customer profile (for the users table and the live rule preview) and every segment with its members
export const GET = withApi(async () => {
  await requireCampaigns();
  return NextResponse.json(await segmentsOverview());
});

// { type: "Dynamic" | "Static", name, description?, rules? | userIds? }
export const POST = withApi(async (request) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ segment: await createSegment(user, await readJson(request)) }, { status: 201 });
});

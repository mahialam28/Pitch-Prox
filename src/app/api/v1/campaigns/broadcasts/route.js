import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { createCampaign, listCampaigns } from "@/lib/campaigns/broadcasts";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  await requireCampaigns();
  return NextResponse.json({ results: await listCampaigns() });
});

// { name, segmentId, templateId, sendOption: "now" | "schedule", scheduledAt? }
export const POST = withApi(async (request) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ campaign: await createCampaign(user, await readJson(request)) }, { status: 201 });
});

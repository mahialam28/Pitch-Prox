import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { deleteSegment, getSegment, requireCampaigns, updateSegment } from "@/lib/campaigns/segments";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  await requireCampaigns();
  return NextResponse.json(await getSegment((await params).segmentId));
});

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ segment: await updateSegment(user, (await params).segmentId, await readJson(request)) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireCampaigns({ write: true });
  await deleteSegment(user, (await params).segmentId);
  return NextResponse.json({ success: true });
});

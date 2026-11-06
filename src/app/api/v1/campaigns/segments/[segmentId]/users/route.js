import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { addSegmentUsers, requireCampaigns } from "@/lib/campaigns/segments";

export const runtime = "nodejs";

// Add users to a Static segment: { userIds }
export const POST = withApi(async (request, { params }) => {
  const user = await requireCampaigns({ write: true });
  const { userIds } = await readJson(request);
  return NextResponse.json({ segment: await addSegmentUsers(user, (await params).segmentId, userIds) });
});

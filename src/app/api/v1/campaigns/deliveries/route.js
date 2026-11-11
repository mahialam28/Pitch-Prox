import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { listParams } from "@/lib/listing";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { listDeliveries } from "@/lib/campaigns/overview";

export const runtime = "nodejs";

// The email outbox: ?status=&source=&search=&page=&pageSize=
export const GET = withApi(async (request) => {
  await requireCampaigns();
  const { searchParams } = new URL(request.url);
  return NextResponse.json(await listDeliveries({ ...listParams(searchParams), status: searchParams.get("status") || null, source: searchParams.get("source") || null }));
});

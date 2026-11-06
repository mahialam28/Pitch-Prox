import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { duplicateTemplate } from "@/lib/campaigns/templates";

export const runtime = "nodejs";

export const POST = withApi(async (_request, { params }) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ template: await duplicateTemplate(user, (await params).templateId) }, { status: 201 });
});

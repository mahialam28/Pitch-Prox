import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { uploadAsset } from "@/lib/campaigns/templates";

export const runtime = "nodejs";

// "Upload Design" image (PNG/JPG, up to 5 MB) → { assetId, url }
export const POST = withApi(async (request) => {
  const user = await requireCampaigns({ write: true });
  const form = await readForm(request);
  return NextResponse.json(await uploadAsset(user, form.get("file")), { status: 201 });
});

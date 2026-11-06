import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { deleteTemplate, getTemplate, updateTemplate } from "@/lib/campaigns/templates";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  await requireCampaigns();
  return NextResponse.json({ template: await getTemplate((await params).templateId) });
});

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ template: await updateTemplate(user, (await params).templateId, await readJson(request)) });
});

// Unused templates are deleted; used ones are archived (their sent emails keep the link)
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json(await deleteTemplate(user, (await params).templateId));
});

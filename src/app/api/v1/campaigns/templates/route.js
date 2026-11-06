import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCampaigns } from "@/lib/campaigns/segments";
import { createTemplate, listTemplates } from "@/lib/campaigns/templates";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  await requireCampaigns();
  return NextResponse.json({ results: await listTemplates() });
});

// { name, emailType, category, subject, preheader, fromName, replyTo, creationMethod, content | html, status, triggerEvent? }
export const POST = withApi(async (request) => {
  const user = await requireCampaigns({ write: true });
  return NextResponse.json({ template: await createTemplate(user, await readJson(request)) }, { status: 201 });
});

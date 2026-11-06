import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { deleteTemplate, getTemplate, updateTemplate } from "@/lib/mail-templates";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const user = await requireStaff();
  return NextResponse.json({ template: await getTemplate(user, (await params).templateId) });
});

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireStaff();
  return NextResponse.json({ template: await updateTemplate(user, (await params).templateId, await readJson(request)) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireStaff();
  await deleteTemplate(user, (await params).templateId);
  return NextResponse.json({ success: true });
});

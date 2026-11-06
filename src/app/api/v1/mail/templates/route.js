import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { createTemplate, listTemplates } from "@/lib/mail-templates";

export const runtime = "nodejs";

// Built-in, team and the signed-in employee's own templates
export const GET = withApi(async () => {
  const user = await requireStaff();
  return NextResponse.json(await listTemplates(user));
});

// { title, category, subject, body, scope?: "personal" | "team" }
export const POST = withApi(async (request) => {
  const user = await requireStaff();
  return NextResponse.json({ template: await createTemplate(user, await readJson(request)) }, { status: 201 });
});

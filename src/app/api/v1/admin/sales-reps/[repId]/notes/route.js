import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { addRepNote, listRepNotes, requireTeamSection } from "@/lib/sales-team";

export const runtime = "nodejs";

// ?kind=coaching|manager&type=Strength… (manager notes: Super Admin and Admin Manager only)
export const GET = withApi(async (request, { params }) => {
  const user = await requireTeamSection();
  const { searchParams } = new URL(request.url);
  return NextResponse.json(await listRepNotes(user, (await params).repId, { kind: searchParams.get("kind") || "coaching", type: searchParams.get("type") || undefined }));
});

export const POST = withApi(async (request, { params }) => {
  const user = await requireTeamSection({ write: true });
  return NextResponse.json({ note: await addRepNote(user, (await params).repId, await readJson(request)) }, { status: 201 });
});

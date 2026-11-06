import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { deleteRepNote, requireTeamSection, updateRepNote } from "@/lib/sales-team";

export const runtime = "nodejs";

// { completed } or text changes (author / Super Admin)
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireTeamSection({ write: true });
  const { repId, noteId } = await params;
  return NextResponse.json({ note: await updateRepNote(user, repId, noteId, await readJson(request)) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireTeamSection({ write: true });
  const { repId, noteId } = await params;
  await deleteRepNote(user, repId, noteId);
  return NextResponse.json({ success: true });
});

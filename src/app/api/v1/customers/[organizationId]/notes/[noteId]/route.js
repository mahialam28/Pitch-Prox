import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, deleteNote, updateNote } from "@/lib/accounts";

export const runtime = "nodejs";

export const DELETE = withApi(async (_request, { params }) => {
  const { organizationId, noteId } = await params;
  const context = await requireAccountAccess(organizationId, { write: true });
  return NextResponse.json({ results: await deleteNote(context, noteId) });
});

// { title?, body?, type?, pinned? } (the author or a Super Admin)
export const PATCH = withApi(async (request, { params }) => {
  const { organizationId, noteId } = await params;
  const context = await requireAccountAccess(organizationId, { write: true });
  return NextResponse.json({ results: await updateNote(context, noteId, await readJson(request)) });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, addNote, listNotes } from "@/lib/accounts";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const { account } = await requireAccountAccess((await params).organizationId);
  return NextResponse.json({ results: await listNotes(account.organization_id) });
});

// { body, pinned? }
export const POST = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  return NextResponse.json({ results: await addNote(context, await readJson(request)) }, { status: 201 });
});

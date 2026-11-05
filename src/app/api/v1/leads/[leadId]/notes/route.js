import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { addLeadNote, listLeadNotes, requireLead } from "@/lib/lead-activity";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const { user, lead } = await requireLead(params);
  const results = await listLeadNotes(user, lead.id);
  return NextResponse.json({ results, count: results.length });
});

export const POST = withApi(async (request, { params }) => {
  const { user, lead } = await requireLead(params);
  return NextResponse.json({ note: await addLeadNote(user, lead.id, (await readJson(request)).body) }, { status: 201 });
});

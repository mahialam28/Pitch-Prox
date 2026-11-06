import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { completeMyNote } from "@/lib/sales-team";

export const runtime = "nodejs";

// { completed: true | false }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireCurrentUser();
  const { completed } = await readJson(request);
  return NextResponse.json({ note: await completeMyNote(user, (await params).noteId, Boolean(completed)) });
});

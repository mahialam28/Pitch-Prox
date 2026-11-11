import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { updateDeletionRequest } from "@/lib/data-deletion";

export const runtime = "nodejs";

// { status: in_progress | done | rejected, note } (Auditors read only)
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireCurrentUser();
  const { requestId } = await params;
  return NextResponse.json({ request: await updateDeletionRequest(user, requestId, await readJson(request)) });
});

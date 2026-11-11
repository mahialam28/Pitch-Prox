import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { listDeletionRequests } from "@/lib/data-deletion";

export const runtime = "nodejs";

// Compliance & Audit → Data Deletion (?status=open|in_progress|done|rejected)
export const GET = withApi(async (request) => {
  const user = await requireCurrentUser();
  return NextResponse.json(await listDeletionRequests(user, { status: new URL(request.url).searchParams.get("status") || null }));
});

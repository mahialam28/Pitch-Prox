import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { refreshSession, revokeSession } from "@/lib/security";

export const runtime = "nodejs";

// "Refresh Session": keep this device signed in for another 7 days
export const PATCH = withApi(async (_request, { params }) => {
  const user = await requireCurrentUser(); const { sessionId } = await params;
  await refreshSession(user, sessionId);
  return NextResponse.json({ success: true });
});

// "Remove Device": sign that device out
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireCurrentUser(); const { sessionId } = await params;
  await revokeSession(user, sessionId);
  return NextResponse.json({ success: true });
});

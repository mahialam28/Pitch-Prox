import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { listSessions, revokeOtherSessions } from "@/lib/security";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  const results = await listSessions(await requireCurrentUser());
  return NextResponse.json({ results, count: results.length });
});

// "Log out of all other devices"
export const DELETE = withApi(async () => NextResponse.json({ revoked: await revokeOtherSessions(await requireCurrentUser()) }));

import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { listLoginActivity } from "@/lib/security";

export const runtime = "nodejs";

// The last 20 sign-in attempts on this account
export const GET = withApi(async () => NextResponse.json({ results: await listLoginActivity(await requireCurrentUser()) }));

import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { withApi } from "@/lib/api";

export const runtime = "nodejs";
export const GET = withApi(async () => NextResponse.json({ user: await requireCurrentUser() }));

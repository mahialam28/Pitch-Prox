import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { markAllRead } from "@/lib/notifications";

export const runtime = "nodejs";

export const POST = withApi(async () => NextResponse.json(await markAllRead(await requireCurrentUser())));

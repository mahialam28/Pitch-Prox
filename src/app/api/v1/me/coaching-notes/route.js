import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { myCoachingNotes } from "@/lib/sales-team";

export const runtime = "nodejs";

// Coaching notes the signed-in sales rep has received
export const GET = withApi(async () => NextResponse.json(await myCoachingNotes(await requireCurrentUser())));

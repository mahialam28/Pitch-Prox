import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { calibrationStatus } from "@/lib/calibration";

export const runtime = "nodejs";

// { required, completed, deferredAt, sessions }: calling is locked while required && !completed
export const GET = withApi(async () => NextResponse.json(await calibrationStatus(await requireCurrentUser())));

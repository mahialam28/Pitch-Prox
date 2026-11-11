import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { mfaStatus } from "@/lib/mfa";

export const runtime = "nodejs";

// { enabled, enabledAt, recoveryCodesLeft }
export const GET = withApi(async () => NextResponse.json(await mfaStatus(await requireCurrentUser())));

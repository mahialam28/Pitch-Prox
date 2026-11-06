import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { endImpersonation } from "@/lib/accounts";

export const runtime = "nodejs";

// Exit impersonation: restores the staff member's own session
export const DELETE = withApi(async () => NextResponse.json(await endImpersonation()));

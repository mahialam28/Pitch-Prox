import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { resetMfaFor } from "@/lib/mfa";
import { ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// Super Admin only: clear someone's two-step login (lost phone, no recovery codes)
export const POST = withApi(async (_request, { params }) => {
  const actor = await requireRole(ROLES.SUPER_ADMIN);
  const { userId } = await params;
  return NextResponse.json(await resetMfaFor(actor, userId));
});

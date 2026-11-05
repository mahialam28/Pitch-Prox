import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { assertCanWrite, requireSection } from "@/lib/permissions";
import { resendInvite } from "@/lib/staff";

export const runtime = "nodejs";

// New activation link (older unused links stop working)
export const POST = withApi(async (request, { params }) => {
  const user = await requireSection("compliance");
  assertCanWrite(user);
  const { employeeId } = await params;
  return NextResponse.json(await resendInvite(user, employeeId), { status: 201 });
});

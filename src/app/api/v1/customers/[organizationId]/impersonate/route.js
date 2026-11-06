import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, startImpersonation } from "@/lib/accounts";

export const runtime = "nodejs";

// { userId?, accessLevel: "full" | "readonly", duration, reason }; swaps the session cookie
export const POST = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  return NextResponse.json(await startImpersonation(context, await readJson(request)), { status: 201 });
});

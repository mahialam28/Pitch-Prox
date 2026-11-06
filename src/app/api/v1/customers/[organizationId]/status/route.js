import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, getAccountDetail, setAccountStatus } from "@/lib/accounts";

export const runtime = "nodejs";

// { status: "active" | "suspended" | "deleted", reason }
export const POST = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId);
  if (context.user.role === "auditor") throw new Error("FORBIDDEN");
  await setAccountStatus(context, await readJson(request));
  // Re-read so the response shows the new status
  return NextResponse.json(await getAccountDetail(await requireAccountAccess(context.account.organization_id)));
});

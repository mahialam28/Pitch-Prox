import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireAccountAccess, getAccountDetail } from "@/lib/accounts";

export const runtime = "nodejs";

// Customer detail page (Super Admin / Support: any account; sales rep: their own accounts)
export const GET = withApi(async (_request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId);
  return NextResponse.json(await getAccountDetail(context));
});

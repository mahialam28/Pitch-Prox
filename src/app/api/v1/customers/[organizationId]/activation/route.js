import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCustomerManager, resendActivation } from "@/lib/customers";

export const runtime = "nodejs";

// New activation link for a customer who hasn't set their password yet
export const POST = withApi(async (_request, { params }) => {
  const context = await requireCustomerManager();
  const { organizationId } = await params;
  return NextResponse.json(await resendActivation(context, organizationId), { status: 201 });
});

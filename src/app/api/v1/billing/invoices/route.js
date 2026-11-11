import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { invoiceRecords, requireBillingAccess } from "@/lib/accounts";

export const runtime = "nodejs";

// Invoice Management: ?organizationId= (one customer's history) &search=
export const GET = withApi(async (request) => {
  const user = await requireBillingAccess();
  const params = new URL(request.url).searchParams;
  return NextResponse.json(await invoiceRecords(user, { organizationId: params.get("organizationId"), search: params.get("search") }));
});

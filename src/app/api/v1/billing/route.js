import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { getSubscription, listInvoices, listPlans } from "@/lib/billing";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// Current plan, usage, available plans and invoices (view only until payments are connected)
export const GET = withApi(async () => {
  const user = await requireRole(...CUSTOMER_ROLES);
  const [subscription, plans, invoices] = await Promise.all([getSubscription(user.organizationId), listPlans(), listInvoices(user.organizationId)]);
  return NextResponse.json({ subscription, plans, invoices });
});

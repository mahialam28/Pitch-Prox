import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { getCustomerTicket } from "@/lib/support";
import { CUSTOMER_ROLES, STAFF_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES); const { ticketId } = await params;
  return NextResponse.json({ ticket: await getCustomerTicket(user, ticketId) });
});

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { createCustomerTicket, listCustomerTickets } from "@/lib/support";
import { CUSTOMER_ROLES, STAFF_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  const results = await listCustomerTickets(await requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES));
  return NextResponse.json({ results, count: results.length });
});

// multipart/form-data: category, priority, subject, description, optional file
export const POST = withApi(async (request) => {
  const user = await requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES);
  return NextResponse.json({ ticket: await createCustomerTicket(user, await readForm(request)) }, { status: 201 });
});

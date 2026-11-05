import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { replyAsCustomer } from "@/lib/support";
import { CUSTOMER_ROLES, STAFF_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// multipart/form-data: body, optional file
export const POST = withApi(async (request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES); const { ticketId } = await params;
  return NextResponse.json({ ticket: await replyAsCustomer(user, ticketId, await readForm(request)) }, { status: 201 });
});

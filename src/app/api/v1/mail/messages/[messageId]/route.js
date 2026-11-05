import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { getMail } from "@/lib/mail";
import { CUSTOMER_ROLES, STAFF_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES); const { messageId } = await params;
  return NextResponse.json({ message: await getMail(user, messageId) });
});

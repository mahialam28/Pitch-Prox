import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { readJson, withApi } from "@/lib/api";
import { listMail, queueMail } from "@/lib/mail";
import { CUSTOMER_ROLES, STAFF_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  const results = await listMail(await requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES));
  return NextResponse.json({ results, count: results.length });
});

// Body: { to, cc?, bcc?, subject, body, trackOpens? } — stored until an email service is connected
export const POST = withApi(async (request) => {
  const user = await requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES);
  return NextResponse.json({ message: await queueMail(user, await readJson(request)) }, { status: 201 });
});

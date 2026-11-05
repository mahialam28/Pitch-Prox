import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { listStaffTickets, openTicketForCustomer, requireSupportAgent } from "@/lib/support-staff";
import { requireStaff } from "@/lib/permissions";

export const runtime = "nodejs";

// Every customer ticket, with tab/card counts (sales reps and the admin "support" section).
// ?opened=me → only tickets this staff member opened for customers
export const GET = withApi(async (request) => {
  const openedByMe = new URL(request.url).searchParams.get("opened") === "me";
  // Any staff member may list the tickets they opened (Mail); the full queue needs the support section
  const user = openedByMe ? await requireStaff() : await requireSupportAgent();
  return NextResponse.json(await listStaffTickets(user, { openedByMe }));
});

// Multipart form: organizationId, category, priority, subject, description, file?
export const POST = withApi(async (request) => {
  const user = await requireSupportAgent();
  return NextResponse.json({ ticket: await openTicketForCustomer(user, await request.formData()) }, { status: 201 });
});

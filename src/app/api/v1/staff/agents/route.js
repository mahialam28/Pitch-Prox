import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { listTicketAgents } from "@/lib/support-staff";
import { requireStaff } from "@/lib/permissions";

export const runtime = "nodejs";

// Staff who can be assigned tickets, with their open-ticket counts (any staff member may see the list)
export const GET = withApi(async () => {
  await requireStaff();
  return NextResponse.json({ results: await listTicketAgents() });
});

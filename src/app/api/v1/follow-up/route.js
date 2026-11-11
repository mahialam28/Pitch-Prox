import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { followUpOptions } from "@/lib/follow-up";

export const runtime = "nodejs";

// The active playbook's Email Templates and Follow-Up guidance (read-only), plus the call facts
// the user can confirm. Customers and sales reps.
export const GET = withApi(async () => NextResponse.json(await followUpOptions()));

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireDashboardUser, salesDashboard } from "@/lib/sales-dashboard";

export const runtime = "nodejs";

// Sales overview: a rep's own numbers, or company-wide for admins with the Dashboard section
export const GET = withApi(async () => NextResponse.json(await salesDashboard(await requireDashboardUser())));

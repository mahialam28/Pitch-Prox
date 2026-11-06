import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { adjustmentsOverview, requireBillingAccess } from "@/lib/accounts";

export const runtime = "nodejs";

// Credits & Adjustments page: every adjustment (a sales rep: their accounts) plus this month's totals
export const GET = withApi(async () => NextResponse.json(await adjustmentsOverview(await requireBillingAccess())));

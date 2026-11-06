import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { pricingOverview } from "@/lib/pricing";

export const runtime = "nodejs";

// Plan & Pricing Control: plans, promo codes, pricing settings and the KPI cards
export const GET = withApi(async () => {
  await requireSection("plans");
  return NextResponse.json(await pricingOverview());
});

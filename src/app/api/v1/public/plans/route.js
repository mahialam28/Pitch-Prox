import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { listPlans } from "@/lib/billing";

export const runtime = "nodejs";

// Plans and prices for the website (no sign-in): the "Your Video Is Ready" choices
export const GET = withApi(async () => {
  const plans = await listPlans();
  return NextResponse.json({
    results: plans.map((plan) => ({ id: plan.id, name: plan.name, description: plan.description, isTrial: plan.isTrial, callsPerMonth: plan.callsPerMonth, reportsPerMonth: plan.reportsPerMonth, priceMonthly: plan.priceMonthly, priceMonthlyCents: plan.priceMonthlyCents })),
  });
});

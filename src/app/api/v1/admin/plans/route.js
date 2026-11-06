import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { createPlan } from "@/lib/pricing";

export const runtime = "nodejs";

// Changes: Super Admin only (Support can view the page)
async function requireSuperAdmin() {
  const user = await requireSection("plans");
  if (user.role !== "super_admin") throw new Error("FORBIDDEN");
  return user;
}

// { name, description?, badge?, displayOrder, monthlyPrice, annualPrice (yearly total), callsIncluded, reportsIncluded, calibrationsIncluded, callOverageFee, reportOverageFee, status }
export const POST = withApi(async (request) => {
  const user = await requireSuperAdmin();
  return NextResponse.json({ plan: await createPlan(user, await readJson(request)) }, { status: 201 });
});

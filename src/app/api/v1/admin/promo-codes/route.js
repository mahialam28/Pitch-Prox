import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { createPromo } from "@/lib/pricing";

export const runtime = "nodejs";

// Changes: Super Admin only (Support can view the page)
async function requireSuperAdmin() {
  const user = await requireSection("plans");
  if (user.role !== "super_admin") throw new Error("FORBIDDEN");
  return user;
}

// { code, name?, description?, discountType, discountValue, planIds?, billingCycles?, minPurchase?, maxUses? | unlimitedUses, perCustomerLimit?, stackable?, startsAt?, expiresAt?, status? }
export const POST = withApi(async (request) => {
  const user = await requireSuperAdmin();
  return NextResponse.json({ promoCode: await createPromo(user, await readJson(request)) }, { status: 201 });
});

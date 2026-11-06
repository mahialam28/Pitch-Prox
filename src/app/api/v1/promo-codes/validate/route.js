import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { validatePromo } from "@/lib/pricing";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// Checkout, upgrades and the rep's User Portal: { code, planId, billingCycle?, organizationId? }
// → { valid, message, discount?, amountOffCents?, totalCents? }
export const POST = withApi(async (request) => {
  const user = await requireCurrentUser();
  const body = await readJson(request);
  // Customers check their own account; staff can name the account they're selling to
  const organizationId = CUSTOMER_ROLES.includes(user.role) ? user.organizationId : typeof body.organizationId === "string" ? body.organizationId : null;
  return NextResponse.json(await validatePromo({ code: body.code, planId: body.planId, billingCycle: body.billingCycle === "annual" ? "annual" : "monthly", organizationId }));
});

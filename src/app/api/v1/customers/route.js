import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { createCustomerAccount, listCustomers, requireCustomerManager } from "@/lib/customers";

export const runtime = "nodejs";

// Sales reps: the customers they own. Admins (Users section): every customer. ?search=
export const GET = withApi(async (request) => {
  const context = await requireCustomerManager();
  const search = new URL(request.url).searchParams.get("search")?.trim().slice(0, 120) || null;
  return NextResponse.json(await listCustomers(context, { search }));
});

// User Portal: { fullName, company, email, phone?, country?, planId, billingCycle, seats }
export const POST = withApi(async (request) => {
  const { user } = await requireCustomerManager();
  return NextResponse.json(await createCustomerAccount(user, await readJson(request)), { status: 201 });
});

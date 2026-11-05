import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { listPlans } from "@/lib/billing";

export const runtime = "nodejs";

// Active subscription plans (User Portal plan picker, pricing views)
export const GET = withApi(async () => {
  await requireCurrentUser();
  return NextResponse.json({ results: await listPlans() });
});

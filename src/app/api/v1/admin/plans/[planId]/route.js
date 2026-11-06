import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { deletePlan, updatePlan } from "@/lib/pricing";

export const runtime = "nodejs";

// Changes: Super Admin only (Support can view the page)
async function requireSuperAdmin() {
  const user = await requireSection("plans");
  if (user.role !== "super_admin") throw new Error("FORBIDDEN");
  return user;
}

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireSuperAdmin();
  return NextResponse.json({ plan: await updatePlan(user, (await params).planId, await readJson(request)) });
});

// Only plans no customer has ever used; others are archived (status "Archived")
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireSuperAdmin();
  await deletePlan(user, (await params).planId);
  return NextResponse.json({ success: true });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { saveSetting } from "@/lib/pricing";

export const runtime = "nodejs";

// Changes: Super Admin only (Support can view the page)
async function requireSuperAdmin() {
  const user = await requireSection("plans");
  if (user.role !== "super_admin") throw new Error("FORBIDDEN");
  return user;
}

// key: trial | enterprise | reportAddOns | billingRules; body: the settings object
export const PUT = withApi(async (request, { params }) => {
  const user = await requireSuperAdmin();
  return NextResponse.json({ settings: await saveSetting(user, (await params).key, await readJson(request)) });
});

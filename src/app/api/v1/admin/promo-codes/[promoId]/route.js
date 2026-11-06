import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { deletePromo, updatePromo } from "@/lib/pricing";

export const runtime = "nodejs";

// Changes: Super Admin only (Support can view the page)
async function requireSuperAdmin() {
  const user = await requireSection("plans");
  if (user.role !== "super_admin") throw new Error("FORBIDDEN");
  return user;
}

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireSuperAdmin();
  return NextResponse.json({ promoCode: await updatePromo(user, (await params).promoId, await readJson(request)) });
});

// Never-used codes are deleted; used ones are archived
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireSuperAdmin();
  return NextResponse.json(await deletePromo(user, (await params).promoId));
});

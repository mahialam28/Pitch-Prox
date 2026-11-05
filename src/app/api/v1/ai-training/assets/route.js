import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { addTrainingAsset, listTrainingAssets } from "@/lib/ai-training";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

export const GET = withApi(async () => NextResponse.json(await listTrainingAssets(await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP))));

// multipart/form-data: file + category
export const POST = withApi(async (request) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  return NextResponse.json({ asset: await addTrainingAsset(user, await readForm(request)) }, { status: 201 });
});

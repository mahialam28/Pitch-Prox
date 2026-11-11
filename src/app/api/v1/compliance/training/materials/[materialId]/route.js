import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { removeMaterial, updateMaterial } from "@/lib/compliance/training";

export const runtime = "nodejs";

// { title?, description?, categoryId? }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { materialId } = await params;
  return NextResponse.json({ material: await updateMaterial(user, materialId, await readJson(request)) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireComplianceWriter();
  const { materialId } = await params;
  return NextResponse.json(await removeMaterial(user, materialId));
});

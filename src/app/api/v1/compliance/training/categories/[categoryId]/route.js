import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { deleteCategory, updateCategory } from "@/lib/compliance/training";

export const runtime = "nodejs";

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { categoryId } = await params;
  return NextResponse.json({ category: await updateCategory(user, categoryId, await readJson(request)) });
});

// ?moveTo=<category id> is required while the category still has Trainings or materials
export const DELETE = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { categoryId } = await params;
  return NextResponse.json(await deleteCategory(user, categoryId, { moveTo: new URL(request.url).searchParams.get("moveTo") }));
});

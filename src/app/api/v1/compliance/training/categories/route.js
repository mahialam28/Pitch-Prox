import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";
import { createCategory, listCategories } from "@/lib/compliance/training";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  await requireCompliance();
  return NextResponse.json({ results: await listCategories() });
});

// { name, description } — names are unique, ignoring capitals
export const POST = withApi(async (request) => {
  const user = await requireComplianceWriter();
  return NextResponse.json({ category: await createCategory(user, await readJson(request)) }, { status: 201 });
});

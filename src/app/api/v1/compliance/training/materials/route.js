import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { requireCompliance, requireComplianceWriter } from "@/lib/compliance/policies";
import { addMaterial, listMaterials } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Training Library: ?search=
export const GET = withApi(async (request) => {
  await requireCompliance();
  return NextResponse.json(await listMaterials({ search: (new URL(request.url).searchParams.get("search") ?? "").trim().slice(0, 120) }));
});

// Upload: multipart { title, description, categoryId, minutes, file | videoUrl }
export const POST = withApi(async (request) => {
  const user = await requireComplianceWriter();
  return NextResponse.json({ material: await addMaterial(user, await readForm(request)) }, { status: 201 });
});

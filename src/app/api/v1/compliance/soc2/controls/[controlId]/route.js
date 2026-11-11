import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { updateControl } from "@/lib/compliance/soc2";

export const runtime = "nodejs";

// { status?, ownerId?, dueDate? }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { controlId } = await params;
  return NextResponse.json(await updateControl(user, controlId, await readJson(request)));
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter, versionAction } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// { action: "submit" | "withdraw" | "approve" | "reject" | "restore" | "discard", note? }
// approve / reject are Super Admin only; reject needs a note.
export const POST = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { policyId, versionId } = await params;
  return NextResponse.json(await versionAction(user, policyId, versionId, await readJson(request)));
});

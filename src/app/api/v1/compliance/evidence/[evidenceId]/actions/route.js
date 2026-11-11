import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { evidenceAction } from "@/lib/compliance/evidence";

export const runtime = "nodejs";

// { action: "submit" | "verify" | "request_changes" | "archive" | "restore", note? }
export const POST = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { evidenceId } = await params;
  return NextResponse.json(await evidenceAction(user, evidenceId, await readJson(request)));
});

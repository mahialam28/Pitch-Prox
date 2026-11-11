import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { incidentAction } from "@/lib/compliance/incidents";

export const runtime = "nodejs";

// { action: "start" } | { action: "resolve", findings, actionsTaken, conclusion }
// | { action: "close", reason? } | { action: "reopen", reason? }
export const POST = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { incidentId } = await params;
  return NextResponse.json(await incidentAction(user, incidentId, await readJson(request)));
});

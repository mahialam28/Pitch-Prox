import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter } from "@/lib/compliance/policies";
import { updateMilestone } from "@/lib/compliance/soc2";

export const runtime = "nodejs";

// { startsOn?, endsOn?, done? }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireComplianceWriter();
  const { milestoneId } = await params;
  return NextResponse.json(await updateMilestone(user, milestoneId, await readJson(request)));
});

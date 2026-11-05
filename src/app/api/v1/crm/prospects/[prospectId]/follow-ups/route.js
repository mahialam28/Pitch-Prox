import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ApiError, readJson, withApi } from "@/lib/api";
import { findProspect, requireProspect } from "@/lib/prospects";

export const runtime = "nodejs";

export const POST = withApi(async (request, { params }) => {
  const { prospect, scope } = await requireProspect(params);
  const { followUpAt } = await readJson(request);
  const date = typeof followUpAt === "string" ? new Date(followUpAt) : null;
  if (!date || Number.isNaN(date.getTime())) throw new ApiError("A valid follow-up date and time is required.");
  if (date <= new Date()) throw new ApiError("Follow-up must be scheduled in the future.");
  await query("UPDATE prospects SET follow_up_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [date, prospect.id]);
  return NextResponse.json({ prospect: await findProspect(prospect.id, scope) });
});

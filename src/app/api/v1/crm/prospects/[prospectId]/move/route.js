import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { readJson, withApi } from "@/lib/api";
import { validateStage } from "@/lib/leads";
import { findProspect, requireProspect } from "@/lib/prospects";

export const runtime = "nodejs";

export const POST = withApi(async (request, { params }) => {
  const { prospect, scope } = await requireProspect(params);
  const stage = validateStage((await readJson(request)).stage);
  await query("UPDATE prospects SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [stage, prospect.id]);
  return NextResponse.json({ prospect: await findProspect(prospect.id, scope) });
});

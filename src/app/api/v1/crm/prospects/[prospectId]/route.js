import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { readJson, withApi } from "@/lib/api";
import { parseLeadFields, updateClause } from "@/lib/leads";
import { findProspect, requireProspect } from "@/lib/prospects";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => NextResponse.json({ prospect: (await requireProspect(params)).prospect }));

export const PATCH = withApi(async (request, { params }) => {
  const { prospect, scope, internal } = await requireProspect(params);
  const { sql, values } = updateClause(parseLeadFields(await readJson(request), { partial: true, internal }));
  await query(`UPDATE prospects SET ${sql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, prospect.id]);
  return NextResponse.json({ prospect: await findProspect(prospect.id, scope) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const { prospect } = await requireProspect(params);
  await query("DELETE FROM prospects WHERE id = ?", [prospect.id]);
  return NextResponse.json({ success: true });
});

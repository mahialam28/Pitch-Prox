import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { readJson, withApi } from "@/lib/api";
import { parseLeadFields, updateClause } from "@/lib/leads";
import { findLead, requireLead } from "@/lib/lead-activity";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => NextResponse.json({ lead: (await requireLead(params)).lead }));

export const PATCH = withApi(async (request, { params }) => {
  const { lead, scope, internal } = await requireLead(params);
  const { sql, values } = updateClause(parseLeadFields(await readJson(request), { partial: true, internal }));
  await query(`UPDATE leads SET ${sql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, lead.id]);
  return NextResponse.json({ lead: await findLead(lead.id, scope) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const { lead } = await requireLead(params);
  await query("DELETE FROM leads WHERE id = ?", [lead.id]);
  return NextResponse.json({ success: true });
});

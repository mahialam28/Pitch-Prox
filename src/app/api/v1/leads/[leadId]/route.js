import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ApiError, readJson, withApi } from "@/lib/api";
import { parseLeadFields, updateClause } from "@/lib/leads";
import { findLead, requireLead } from "@/lib/lead-activity";
import { applyWrongNumberOutcome, parsePhones, savePhones, withPhones } from "@/lib/phones";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => NextResponse.json({ lead: await withPhones("lead", (await requireLead(params)).lead) }));

export const PATCH = withApi(async (request, { params }) => {
  const { user, lead, scope, internal } = await requireLead(params);
  const body = await readJson(request);
  const phones = parsePhones(body);
  const fields = await applyWrongNumberOutcome(user, "lead", lead.id, parseLeadFields(body, { partial: true, internal }), body.phoneId);
  // The phone_number column follows the numbers list
  if (phones !== undefined) delete fields.phone_number;
  // Nothing else changed (e.g. "Wrong Number" only marked one of several numbers): just touch the record
  if (!Object.keys(fields).length && phones === undefined && body.outcome === undefined) throw new ApiError("No updates supplied.");
  if (Object.keys(fields).length) {
    const { sql, values } = updateClause(fields);
    await query(`UPDATE leads SET ${sql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, lead.id]);
  } else {
    await query("UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [lead.id]);
  }
  await savePhones("lead", lead.id, user.organizationId, phones);
  return NextResponse.json({ lead: await withPhones("lead", await findLead(lead.id, scope)) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const { lead } = await requireLead(params);
  await query("DELETE FROM leads WHERE id = ?", [lead.id]);
  return NextResponse.json({ success: true });
});

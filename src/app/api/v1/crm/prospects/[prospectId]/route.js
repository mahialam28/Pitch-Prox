import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ApiError, readJson, withApi } from "@/lib/api";
import { parseLeadFields, updateClause } from "@/lib/leads";
import { findProspect, requireProspect } from "@/lib/prospects";
import { applyWrongNumberOutcome, parsePhones, savePhones, withPhones } from "@/lib/phones";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => NextResponse.json({ prospect: await withPhones("prospect", (await requireProspect(params)).prospect) }));

export const PATCH = withApi(async (request, { params }) => {
  const { user, prospect, scope, internal } = await requireProspect(params);
  const body = await readJson(request);
  const phones = parsePhones(body);
  const fields = await applyWrongNumberOutcome(user, "prospect", prospect.id, parseLeadFields(body, { partial: true, internal }), body.phoneId);
  // The phone_number column follows the numbers list
  if (phones !== undefined) delete fields.phone_number;
  // Nothing else changed (e.g. "Wrong Number" only marked one of several numbers): just touch the record
  if (!Object.keys(fields).length && phones === undefined && body.outcome === undefined) throw new ApiError("No updates supplied.");
  if (Object.keys(fields).length) {
    const { sql, values } = updateClause(fields);
    await query(`UPDATE prospects SET ${sql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, prospect.id]);
  } else {
    await query("UPDATE prospects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [prospect.id]);
  }
  await savePhones("prospect", prospect.id, user.organizationId, phones);
  return NextResponse.json({ prospect: await withPhones("prospect", await findProspect(prospect.id, scope)) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const { prospect } = await requireProspect(params);
  await query("DELETE FROM prospects WHERE id = ?", [prospect.id]);
  return NextResponse.json({ success: true });
});

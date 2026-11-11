import { NextResponse } from "next/server";
import { createId, query } from "@/lib/db";
import { readJson, withApi } from "@/lib/api";
import { leadColumns, parseLeadFields } from "@/lib/leads";
import { likePattern } from "@/lib/listing";
import { requirePipelineUser } from "@/lib/pipeline";
import { digitsOf, parsePhones, savePhones, withPhones } from "@/lib/phones";

export const runtime = "nodejs";

// Customers: their company's leads. Sales reps: the leads assigned to them. Managers: all PitchProX leads.
export const GET = withApi(async (request) => {
  const { scope } = await requirePipelineUser();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const stage = searchParams.get("stage")?.trim();
  const where = scope("leads");
  const clauses = [where.sql];
  const values = [...where.values];
  if (search) {
    // Any of the contact's numbers matches, typed with or without formatting
    const digits = digitsOf(search);
    clauses.push(`(name LIKE ? OR email LIKE ? OR phone_number LIKE ?${digits.length >= 3 ? " OR id IN (SELECT lead_id FROM contact_phones WHERE lead_id IS NOT NULL AND digits LIKE ?)" : ""})`);
    values.push(likePattern(search), likePattern(search), likePattern(search), ...(digits.length >= 3 ? [likePattern(digits)] : []));
  }
  if (stage) { clauses.push("stage = ?"); values.push(stage); }
  const results = await query(`SELECT ${leadColumns} FROM leads WHERE ${clauses.join(" AND ")} ORDER BY updated_at DESC`, values);
  return NextResponse.json({ results: await withPhones("lead", results), count: results.length });
});

export const POST = withApi(async (request) => {
  const { user, scope, internal } = await requirePipelineUser();
  const body = await readJson(request);
  const fields = { ...parseLeadFields(body, { internal }), assigned_to: user.id };
  const id = createId("lead");
  await query(`INSERT INTO leads (id, organization_id, ${Object.keys(fields).join(", ")}) VALUES (?, ?, ${Object.keys(fields).map(() => "?").join(", ")})`, [id, user.organizationId, ...Object.values(fields)]);
  await savePhones("lead", id, user.organizationId, parsePhones(body));
  const where = scope("leads");
  const [lead] = await query(`SELECT ${leadColumns} FROM leads WHERE leads.id = ? AND ${where.sql}`, [id, ...where.values]);
  return NextResponse.json({ lead: await withPhones("lead", lead) }, { status: 201 });
});

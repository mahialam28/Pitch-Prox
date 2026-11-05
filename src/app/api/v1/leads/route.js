import { NextResponse } from "next/server";
import { createId, query } from "@/lib/db";
import { readJson, withApi } from "@/lib/api";
import { leadColumns, parseLeadFields } from "@/lib/leads";
import { likePattern } from "@/lib/listing";
import { requirePipelineUser } from "@/lib/pipeline";

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
  if (search) { clauses.push("(name LIKE ? OR email LIKE ? OR phone_number LIKE ?)"); values.push(likePattern(search), likePattern(search), likePattern(search)); }
  if (stage) { clauses.push("stage = ?"); values.push(stage); }
  const results = await query(`SELECT ${leadColumns} FROM leads WHERE ${clauses.join(" AND ")} ORDER BY updated_at DESC`, values);
  return NextResponse.json({ results, count: results.length });
});

export const POST = withApi(async (request) => {
  const { user, scope, internal } = await requirePipelineUser();
  const fields = { ...parseLeadFields(await readJson(request), { internal }), assigned_to: user.id };
  const id = createId("lead");
  await query(`INSERT INTO leads (id, organization_id, ${Object.keys(fields).join(", ")}) VALUES (?, ?, ${Object.keys(fields).map(() => "?").join(", ")})`, [id, user.organizationId, ...Object.values(fields)]);
  const where = scope("leads");
  const [lead] = await query(`SELECT ${leadColumns} FROM leads WHERE leads.id = ? AND ${where.sql}`, [id, ...where.values]);
  return NextResponse.json({ lead }, { status: 201 });
});

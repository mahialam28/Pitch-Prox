import { NextResponse } from "next/server";
import { createId, query } from "@/lib/db";
import { ApiError, readJson, withApi } from "@/lib/api";
import { parseLeadFields, prospectColumns } from "@/lib/leads";
import { requirePipelineUser } from "@/lib/pipeline";
import { findLead } from "@/lib/lead-activity";
import { findProspect } from "@/lib/prospects";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  const { scope } = await requirePipelineUser();
  const where = scope("prospects");
  const results = await query(`SELECT ${prospectColumns} FROM prospects WHERE ${where.sql} ORDER BY updated_at DESC`, where.values);
  return NextResponse.json({ results, count: results.length });
});

export const POST = withApi(async (request) => {
  const { user, scope, internal } = await requirePipelineUser();
  const body = await readJson(request);
  const fields = { ...parseLeadFields(body, { internal }), assigned_to: user.id };
  const leadId = body.leadId || null;
  if (leadId && !(await findLead(leadId, scope))) throw new ApiError("Linked lead not found.");
  const id = createId("prospect");
  const columns = ["id", "organization_id", "lead_id", ...Object.keys(fields)];
  await query(`INSERT INTO prospects (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`, [id, user.organizationId, leadId, ...Object.values(fields)]);
  return NextResponse.json({ prospect: await findProspect(id, scope) }, { status: 201 });
});

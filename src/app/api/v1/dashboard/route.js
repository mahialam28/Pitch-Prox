import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";
export const GET = withApi(async () => {
  const user = await requireRole(...CUSTOMER_ROLES);
  const [total] = await query("SELECT COUNT(*) AS count FROM leads WHERE organization_id = ?", [user.organizationId]);
  const [qualified] = await query("SELECT COUNT(*) AS count FROM leads WHERE organization_id = ? AND stage IN ('Qualified', 'Appointment Set')", [user.organizationId]);
  const totalLeads = Number(total.count); const qualifiedLeads = Number(qualified.count);
  const pipeline = (await query("SELECT stage AS name, COUNT(*) AS value FROM leads WHERE organization_id = ? GROUP BY stage ORDER BY value DESC", [user.organizationId])).map((row) => ({ name: row.name, value: Number(row.value) }));
  const recentLeads = await query("SELECT id, name, stage, status, updated_at AS updatedAt FROM leads WHERE organization_id = ? ORDER BY updated_at DESC LIMIT 5", [user.organizationId]);
  return NextResponse.json({
    user: { name: user.name },
    metrics: { totalLeads, qualifiedLeads, conversionRate: totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0 },
    pipeline,
    recentLeads,
  });
});

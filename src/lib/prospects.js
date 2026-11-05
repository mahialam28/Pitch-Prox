import { query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { prospectColumns } from "@/lib/leads";
import { requirePipelineUser } from "@/lib/pipeline";

// One prospect the user can see (their company's, or for sales reps their own)
export async function findProspect(id, scope) {
  const where = scope("prospects");
  const [prospect] = await query(`SELECT ${prospectColumns} FROM prospects WHERE prospects.id = ? AND ${where.sql}`, [id, ...where.values]);
  return prospect;
}

// Resolve the signed-in user and a prospect they're allowed to see
export async function requireProspect(params) {
  const context = await requirePipelineUser();
  const { prospectId } = await params;
  const prospect = await findProspect(prospectId, context.scope);
  if (!prospect) throw new ApiError("Prospect not found.", 404);
  return { ...context, prospect };
}

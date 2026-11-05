import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { leadColumns } from "@/lib/leads";
import { requirePipelineUser } from "@/lib/pipeline";

const noteColumns = "lead_notes.id, lead_notes.body, lead_notes.created_at AS createdAt, users.name AS authorName";

// One lead the user can see (their company's, or for sales reps their own)
export async function findLead(id, scope) {
  const where = scope("leads");
  const [lead] = await query(`SELECT ${leadColumns} FROM leads WHERE leads.id = ? AND ${where.sql}`, [id, ...where.values]);
  return lead;
}

// Resolve the signed-in user and a lead they're allowed to see
export async function requireLead(params) {
  const context = await requirePipelineUser();
  const { leadId } = await params;
  const lead = await findLead(leadId, context.scope);
  if (!lead) throw new ApiError("Lead not found.", 404);
  return { ...context, lead };
}

export const listLeadNotes = (user, leadId) =>
  query(`SELECT ${noteColumns} FROM lead_notes JOIN users ON users.id = lead_notes.user_id WHERE lead_notes.lead_id = ? AND lead_notes.organization_id = ? ORDER BY lead_notes.created_at DESC`, [leadId, user.organizationId]);

export async function addLeadNote(user, leadId, body) {
  const text = typeof body === "string" ? body.trim() : "";
  if (!text) throw new ApiError("Note text is required.");
  if (text.length > 5000) throw new ApiError("Notes must be 5000 characters or fewer.");
  const id = createId("note");
  await query("INSERT INTO lead_notes (id, lead_id, organization_id, user_id, body) VALUES (?, ?, ?, ?, ?)", [id, leadId, user.organizationId, user.id, text]);
  await query("UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = ? AND organization_id = ?", [leadId, user.organizationId]);
  const [note] = await query(`SELECT ${noteColumns} FROM lead_notes JOIN users ON users.id = lead_notes.user_id WHERE lead_notes.id = ?`, [id]);
  return note;
}

export async function setLeadFollowUp(user, leadId, followUpAt) {
  const date = typeof followUpAt === "string" ? new Date(followUpAt) : null;
  if (!date || Number.isNaN(date.getTime())) throw new ApiError("A valid follow-up date and time is required.");
  if (date <= new Date()) throw new ApiError("Follow-up must be scheduled in the future.");
  await query("UPDATE leads SET follow_up_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND organization_id = ?", [date, leadId, user.organizationId]);
  const [lead] = await query(`SELECT ${leadColumns} FROM leads WHERE id = ? AND organization_id = ?`, [leadId, user.organizationId]);
  return lead;
}

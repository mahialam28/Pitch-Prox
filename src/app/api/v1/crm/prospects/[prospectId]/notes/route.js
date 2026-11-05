import { NextResponse } from "next/server";
import { createId, query } from "@/lib/db";
import { ApiError, readJson, withApi } from "@/lib/api";
import { requireProspect } from "@/lib/prospects";

export const runtime = "nodejs";
const noteColumns = "prospect_notes.id, prospect_notes.body, prospect_notes.created_at AS createdAt, users.name AS authorName";

export const GET = withApi(async (_request, { params }) => {
  const { user, prospect } = await requireProspect(params);
  const results = await query(`SELECT ${noteColumns} FROM prospect_notes JOIN users ON users.id = prospect_notes.user_id WHERE prospect_notes.prospect_id = ? AND prospect_notes.organization_id = ? ORDER BY prospect_notes.created_at DESC`, [prospect.id, user.organizationId]);
  return NextResponse.json({ results, count: results.length });
});

export const POST = withApi(async (request, { params }) => {
  const { user, prospect } = await requireProspect(params);
  const { body } = await readJson(request);
  const text = typeof body === "string" ? body.trim() : "";
  if (!text) throw new ApiError("Note text is required.");
  if (text.length > 5000) throw new ApiError("Notes must be 5000 characters or fewer.");
  const id = createId("note");
  await query("INSERT INTO prospect_notes (id, prospect_id, organization_id, user_id, body) VALUES (?, ?, ?, ?, ?)", [id, prospect.id, user.organizationId, user.id, text]);
  await query("UPDATE prospects SET updated_at = CURRENT_TIMESTAMP WHERE id = ? AND organization_id = ?", [prospect.id, user.organizationId]);
  const [note] = await query(`SELECT ${noteColumns} FROM prospect_notes JOIN users ON users.id = prospect_notes.user_id WHERE prospect_notes.id = ?`, [id]);
  return NextResponse.json({ note }, { status: 201 });
});

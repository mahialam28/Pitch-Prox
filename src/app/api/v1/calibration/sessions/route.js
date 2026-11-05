import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { ApiError, readJson, withApi } from "@/lib/api";
import { createId, query } from "@/lib/db";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

const columns = "id, rounds_completed AS roundsCompleted, duration_seconds AS durationSeconds, completed_at AS completedAt";

// The user's recent calibration sessions
export const GET = withApi(async () => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const results = await query(`SELECT ${columns} FROM calibration_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT 20`, [user.id]);
  const [{ total }] = await query("SELECT COUNT(*) AS total FROM calibration_sessions WHERE user_id = ?", [user.id]);
  return NextResponse.json({ results, total: Number(total) });
});

// Record a finished session. Scores need an AI provider, so only timing is stored for now.
export const POST = withApi(async (request) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const { durationSeconds, roundsCompleted } = await readJson(request);
  if (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 6 * 60 * 60) throw new ApiError("durationSeconds must be a whole number of seconds (up to 6 hours).");
  if (roundsCompleted !== undefined && roundsCompleted !== null && (!Number.isInteger(roundsCompleted) || roundsCompleted < 0 || roundsCompleted > 50)) throw new ApiError("roundsCompleted must be between 0 and 50.");
  const id = createId("calib");
  await query("INSERT INTO calibration_sessions (id, organization_id, user_id, rounds_completed, duration_seconds) VALUES (?, ?, ?, ?, ?)", [id, user.organizationId, user.id, roundsCompleted ?? null, durationSeconds]);
  const [session] = await query(`SELECT ${columns} FROM calibration_sessions WHERE id = ?`, [id]);
  const [{ total }] = await query("SELECT COUNT(*) AS total FROM calibration_sessions WHERE user_id = ?", [user.id]);
  return NextResponse.json({ session, total: Number(total) }, { status: 201 });
});

// Reset calibration: forget the user's sessions so they go through calibration again
export const DELETE = withApi(async () => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const result = await query("DELETE FROM calibration_sessions WHERE user_id = ?", [user.id]);
  return NextResponse.json({ removed: result.affectedRows });
});

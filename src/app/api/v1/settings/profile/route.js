import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { jsonError, readJson, withApi } from "@/lib/api";

export const runtime = "nodejs";

export const GET = withApi(async () => NextResponse.json({ profile: await requireCurrentUser() }));

export const PATCH = withApi(async (request) => {
  const user = await requireCurrentUser(); const { name } = await readJson(request);
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed || trimmed.length > 255) return jsonError("Your name is required (255 characters max).");
  await query("UPDATE users SET name = ? WHERE id = ?", [trimmed, user.id]);
  return NextResponse.json({ profile: { ...user, name: trimmed } });
});

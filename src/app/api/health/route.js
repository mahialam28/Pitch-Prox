import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Uptime check for the hosting panel / monitoring (UptimeRobot etc.). No sign-in, no secrets:
// it only says whether the app and the database answer. 200 = healthy, 503 = database down.
const DB_TIMEOUT_MS = 3000;

export async function GET() {
  const started = Date.now();
  let database = "ok";
  try {
    await Promise.race([query("SELECT 1"), new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), DB_TIMEOUT_MS))]);
  } catch {
    database = "down";
  }
  const healthy = database === "ok";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", database, responseMs: Date.now() - started, time: new Date().toISOString() },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}

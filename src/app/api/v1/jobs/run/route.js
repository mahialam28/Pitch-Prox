import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { runCampaignJobs } from "@/lib/campaigns/runner";

export const runtime = "nodejs";

export const maxDuration = 300;

// Scheduler call (Vercel Cron sends "Authorization: Bearer $CRON_SECRET") or a Super Admin's "Run now"
async function authorize(request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (secret && header.startsWith("Bearer ")) {
    const given = Buffer.from(header.slice(7));
    const expected = Buffer.from(secret);
    if (given.length === expected.length && timingSafeEqual(given, expected)) return;
    throw new Error("FORBIDDEN");
  }
  const user = await requireCurrentUser();
  if (user.role !== "super_admin") throw new Error("FORBIDDEN");
}

const run = withApi(async (request) => {
  await authorize(request);
  return NextResponse.json(await runCampaignJobs());
});
export { run as GET, run as POST };

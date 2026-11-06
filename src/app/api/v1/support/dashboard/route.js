import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { supportDashboard } from "@/lib/support-dashboard";

export const runtime = "nodejs";

// Support Dashboard: ?range=7d|30d (Super Admin and Support)
export const GET = withApi(async (request) => {
  await requireSection("support");
  return NextResponse.json(await supportDashboard({ range: new URL(request.url).searchParams.get("range") || "7d" }));
});

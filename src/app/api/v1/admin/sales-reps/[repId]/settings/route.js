import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireTeamSection, saveRepSettings } from "@/lib/sales-team";

export const runtime = "nodejs";

// Workspace and access settings from the rep's Account Settings tab
export const PUT = withApi(async (request, { params }) => {
  const user = await requireTeamSection({ write: true });
  return NextResponse.json({ settings: await saveRepSettings(user, (await params).repId, await readJson(request)) });
});

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { dismissAnnouncement } from "@/lib/announcements";

export const runtime = "nodejs";

// Hide an announcement from your own list
export const POST = withApi(async (_request, { params }) => {
  const user = await requireStaff();
  await dismissAnnouncement(user, (await params).announcementId);
  return NextResponse.json({ success: true });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { deleteAnnouncement, updateAnnouncement } from "@/lib/announcements";

export const runtime = "nodejs";

// Edit, or { archived: true | false } (author or Super Admin)
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireStaff();
  return NextResponse.json({ announcement: await updateAnnouncement(user, (await params).announcementId, await readJson(request)) });
});

// Scheduled announcements only; published ones are archived
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireStaff();
  await deleteAnnouncement(user, (await params).announcementId);
  return NextResponse.json({ success: true });
});

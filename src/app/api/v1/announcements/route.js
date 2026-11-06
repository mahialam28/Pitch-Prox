import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { createAnnouncement, listAnnouncements } from "@/lib/announcements";

export const runtime = "nodejs";

// Announcements for the signed-in employee: ?tab=active|scheduled|archived
export const GET = withApi(async (request) => {
  const user = await requireStaff();
  return NextResponse.json(await listAnnouncements(user, { tab: new URL(request.url).searchParams.get("tab") || "active" }));
});

// Super Admin, Admin Manager and Support post: { title, body, priority, audience, publishAt?, expiresAt?, notify }
export const POST = withApi(async (request) => {
  const user = await requireStaff();
  return NextResponse.json({ announcement: await createAnnouncement(user, await readJson(request)) }, { status: 201 });
});

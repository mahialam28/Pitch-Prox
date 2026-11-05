import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { deleteEvent, requireCalendarUser, updateEvent } from "@/lib/calendar";

export const runtime = "nodejs";

export const PUT = withApi(async (request, { params }) => {
  const user = await requireCalendarUser();
  const { eventId } = await params;
  return NextResponse.json({ event: await updateEvent(user, eventId, await readJson(request)) });
});

export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireCalendarUser();
  const { eventId } = await params;
  await deleteEvent(user, eventId);
  return NextResponse.json({ success: true });
});

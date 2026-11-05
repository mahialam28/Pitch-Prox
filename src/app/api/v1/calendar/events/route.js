import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { createEvent, listEvents, requireCalendarUser } from "@/lib/calendar";

export const runtime = "nodejs";

// ?from=YYYY-MM-DD&to=YYYY-MM-DD
export const GET = withApi(async (request) => {
  const user = await requireCalendarUser();
  const { searchParams } = new URL(request.url);
  return NextResponse.json({ results: await listEvents(user, { from: searchParams.get("from"), to: searchParams.get("to") }) });
});

// { title, description?, eventType, department?, visibility?, locationLink?, startDate, startTime, endDate?, endTime }
export const POST = withApi(async (request) => {
  const user = await requireCalendarUser();
  return NextResponse.json({ event: await createEvent(user, await readJson(request)) }, { status: 201 });
});

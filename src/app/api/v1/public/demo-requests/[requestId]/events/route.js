import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { recordDemoWatch } from "@/lib/demo-requests";

export const runtime = "nodejs";

// { event: "started" | "completed" } from the video player
export const POST = withApi(async (request, { params }) => {
  const { requestId } = await params;
  const { event } = await readJson(request);
  return NextResponse.json(await recordDemoWatch(requestId, event));
});

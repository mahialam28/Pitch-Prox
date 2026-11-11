import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requestClient } from "@/lib/auth";
import { limit } from "@/lib/rate-limit";
import { createDemoRequest } from "@/lib/demo-requests";

export const runtime = "nodejs";

// Website "See how it works" form → { id } (the video page records watching with it). 10 per hour per IP.
export const POST = withApi(async (request) => {
  const { ip } = await requestClient();
  await limit("demo-request-ip", ip);
  return NextResponse.json(await createDemoRequest(await readJson(request), { ip }), { status: 201 });
});

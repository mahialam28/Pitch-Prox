import { NextResponse } from "next/server";
import { ApiError, readJson, withApi } from "@/lib/api";
import { completeCall } from "@/lib/calls";
import { SERVICE_HEADER, serviceSecretMatches } from "@/lib/ai/call-token";

export const runtime = "nodejs";

// Call service only: the post-call record when a call ends → { status, summary }
export const POST = withApi(async (request, { params }) => {
  if (!serviceSecretMatches(request.headers.get(SERVICE_HEADER))) throw new ApiError("Not found.", 404);
  const { callId } = await params;
  const body = await readJson(request);
  return NextResponse.json(await completeCall(callId, body.handoff ?? {}, { endedReason: body.endedReason ?? "hangup" }));
});

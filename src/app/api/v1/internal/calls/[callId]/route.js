import { NextResponse } from "next/server";
import { ApiError, withApi } from "@/lib/api";
import { callContextForService } from "@/lib/calls";
import { SERVICE_HEADER, serviceSecretMatches } from "@/lib/ai/call-token";

export const runtime = "nodejs";

// Call service only: the context the AI Core starts with (secret header, never a browser)
export const GET = withApi(async (request, { params }) => {
  if (!serviceSecretMatches(request.headers.get(SERVICE_HEADER))) throw new ApiError("Not found.", 404);
  const { callId } = await params;
  return NextResponse.json({ context: await callContextForService(callId) });
});

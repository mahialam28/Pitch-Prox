import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { getCurrentUser, requestClient } from "@/lib/auth";
import { limit } from "@/lib/rate-limit";
import { createDeletionRequest } from "@/lib/data-deletion";

export const runtime = "nodejs";

// /data-deletion form: { name, email, scope, details } → { reference }. Signed-in people ask for
// their own email. 5 per hour per IP.
export const POST = withApi(async (request) => {
  const { ip } = await requestClient();
  await limit("data-deletion-ip", ip);
  const user = await getCurrentUser();
  return NextResponse.json(await createDeletionRequest(await readJson(request), { ip, user: user && !user.impersonation ? user : null }), { status: 201 });
});

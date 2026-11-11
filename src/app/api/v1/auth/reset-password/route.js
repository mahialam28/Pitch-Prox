import { NextResponse } from "next/server";
import { limit } from "@/lib/rate-limit";
import { requestClient } from "@/lib/auth";
import { readJson, withApi } from "@/lib/api";
import { checkResetToken, resetPassword } from "@/lib/password-reset";

export const runtime = "nodejs";

// ?token=… → is the link still good?
export const GET = withApi(async (request) => {
  return NextResponse.json(await checkResetToken(new URL(request.url).searchParams.get("token")));
});

// { token, password } → new password; all sessions of the account end, then sign in again
export const POST = withApi(async (request) => {
  // Attempt limit per IP
  await limit("reset-password-ip", (await requestClient()).ip);
  const { token, password } = await readJson(request);
  await resetPassword(token, password);
  return NextResponse.json({ ok: true, next: "/sign-in" });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requestClient } from "@/lib/auth";
import { requestPasswordReset } from "@/lib/password-reset";
import { limit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// { email } → a reset link is emailed if the account exists. The answer is always the same.
export const POST = withApi(async (request) => {
  const { email } = await readJson(request);
  const { ip } = await requestClient();
  await limit("forgot-password-ip", ip);
  await requestPasswordReset(email, { ip });
  return NextResponse.json({ ok: true, message: "If an account uses this email, a reset link is on its way." });
});

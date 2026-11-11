import { NextResponse } from "next/server";
import { limit } from "@/lib/rate-limit";
import { readJson, withApi } from "@/lib/api";
import { createSession, requestClient } from "@/lib/auth";
import { acceptInvite } from "@/lib/staff";

export const runtime = "nodejs";

// { token } from the activation link → signs the employee in to start onboarding
export const POST = withApi(async (request) => {
  // Attempt limit per IP
  await limit("invite-link-ip", (await requestClient()).ip);
  const { token } = await readJson(request);
  const user = await acceptInvite(token);
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role }, next: "/onboarding" });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { acceptInvite } from "@/lib/staff";

export const runtime = "nodejs";

// { token } from the activation link → signs the employee in to start onboarding
export const POST = withApi(async (request) => {
  const { token } = await readJson(request);
  const user = await acceptInvite(token);
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role }, next: "/onboarding" });
});

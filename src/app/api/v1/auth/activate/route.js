import { NextResponse } from "next/server";
import { limit } from "@/lib/rate-limit";
import { readJson, withApi } from "@/lib/api";
import { createSession, requestClient } from "@/lib/auth";
import { activateAccount } from "@/lib/customers";

export const runtime = "nodejs";

// { token, password } from a customer activation link → signs the customer in
export const POST = withApi(async (request) => {
  // Attempt limit per IP
  await limit("invite-link-ip", (await requestClient()).ip);
  const { token, password } = await readJson(request);
  const user = await activateAccount(token, password);
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role }, next: "/user/dashboard" });
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { activateAccount } from "@/lib/customers";

export const runtime = "nodejs";

// { token, password } from a customer activation link → signs the customer in
export const POST = withApi(async (request) => {
  const { token, password } = await readJson(request);
  const user = await activateAccount(token, password);
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role }, next: "/user/dashboard" });
});

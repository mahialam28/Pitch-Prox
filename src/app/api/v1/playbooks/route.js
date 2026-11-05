import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { readJson, withApi } from "@/lib/api";
import { createCustomPlaybook, getPlaybook, listPlaybooks, setActivePlaybook } from "@/lib/playbooks";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

export const GET = withApi(async () => NextResponse.json(await listPlaybooks(await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP))));

// Create a custom playbook from the wizard; `activate: true` also makes it the active one
export const POST = withApi(async (request) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const body = await readJson(request);
  const id = await createCustomPlaybook(user, body);
  const playbook = body.activate ? await setActivePlaybook(user, id) : await getPlaybook(user, id);
  return NextResponse.json({ playbook }, { status: 201 });
});

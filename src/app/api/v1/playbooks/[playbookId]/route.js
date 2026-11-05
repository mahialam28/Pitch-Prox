import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { readJson, withApi } from "@/lib/api";
import { deleteCustomPlaybook, getPlaybook, setActivePlaybook, updateCustomPlaybook } from "@/lib/playbooks";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP); const { playbookId } = await params;
  return NextResponse.json({ playbook: await getPlaybook(user, playbookId) });
});

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP); const { playbookId } = await params;
  const body = await readJson(request);
  await updateCustomPlaybook(user, playbookId, body);
  const playbook = body.activate ? await setActivePlaybook(user, playbookId) : await getPlaybook(user, playbookId);
  return NextResponse.json({ playbook });
});

export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP); const { playbookId } = await params;
  await deleteCustomPlaybook(user, playbookId);
  return NextResponse.json({ success: true });
});

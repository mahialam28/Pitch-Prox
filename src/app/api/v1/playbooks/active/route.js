import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { ApiError, readJson, withApi } from "@/lib/api";
import { setActivePlaybook } from "@/lib/playbooks";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// Choose the playbook the AI uses on this user's calls
export const PUT = withApi(async (request) => {
  const user = await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP);
  const { playbookId } = await readJson(request);
  if (typeof playbookId !== "string" || !playbookId) throw new ApiError("Choose a playbook.");
  return NextResponse.json({ playbook: await setActivePlaybook(user, playbookId) });
});

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { activePlaybookRuntime } from "@/lib/playbooks";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// The playbook the live-call AI should load for the signed-in user: their active playbook's
// version in force, without price, access, cover art, marketplace text or internal notes.
// { playbookId, title, kind, version, playbook } — playbook is null for playbooks that were
// never published from the Super Admin builder (see docs/ai-playbook-contract.md).
export const GET = withApi(async () => NextResponse.json(await activePlaybookRuntime(await requireRole(...CUSTOMER_ROLES, ROLES.SALES_REP))));

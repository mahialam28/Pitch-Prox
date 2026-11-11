import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { listVersions, requireBuilder } from "@/lib/playbook-builder";

export const runtime = "nodejs";

// Version history of a platform playbook (newest first; the one in force is marked active)
export const GET = withApi(async (_request, { params }) => {
  await requireBuilder();
  const { playbookId } = await params;
  return NextResponse.json(await listVersions(playbookId));
});

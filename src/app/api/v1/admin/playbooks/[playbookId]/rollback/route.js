import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireBuilder, rollbackVersion } from "@/lib/playbook-builder";

export const runtime = "nodejs";

// { version, releaseNotes } — re-publishes an earlier version as the newest one
export const POST = withApi(async (request, { params }) => {
  const user = await requireBuilder();
  const { playbookId } = await params;
  return NextResponse.json(await rollbackVersion(user, playbookId, await readJson(request)));
});

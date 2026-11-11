import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { publishBuild, requireBuilder } from "@/lib/playbook-builder";

export const runtime = "nodejs";

// { revision, releaseNotes, acknowledgeWarnings } → 200 { ok, playbookId, version } or
// 422 { ok: false, errors, warnings, needsAcknowledgement } when the checks block it
export const POST = withApi(async (request, { params }) => {
  const user = await requireBuilder();
  const { buildId } = await params;
  const result = await publishBuild(user, buildId, await readJson(request));
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
});

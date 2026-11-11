import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { checkBuild, requireBuilder } from "@/lib/playbook-builder";

export const runtime = "nodejs";

// Publish checks on the saved draft: { ok, errors, warnings, nextVersion, changedSections, releaseNotesRequired }
export const GET = withApi(async (_request, { params }) => {
  await requireBuilder();
  const { buildId } = await params;
  return NextResponse.json(await checkBuild(buildId));
});

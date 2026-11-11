import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { builderLibrary, createBuild, requireBuilder } from "@/lib/playbook-builder";

export const runtime = "nodejs";

// Playbook Library: platform playbooks + the drafts being built
export const GET = withApi(async () => {
  await requireBuilder();
  return NextResponse.json(await builderLibrary());
});

// New draft: { content, currentStep?, playbookId? (to edit an existing platform playbook) }
export const POST = withApi(async (request) => {
  const user = await requireBuilder();
  return NextResponse.json(await createBuild(user, await readJson(request)), { status: 201 });
});

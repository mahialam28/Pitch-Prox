import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { deleteBuild, getBuild, requireBuilder, saveBuild } from "@/lib/playbook-builder";

export const runtime = "nodejs";

export const GET = withApi(async (_request, { params }) => {
  await requireBuilder();
  const { buildId } = await params;
  return NextResponse.json(await getBuild(buildId));
});

// Save: { content?, currentStep?, revision } — 409 when someone saved after this editor loaded it
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireBuilder();
  const { buildId } = await params;
  return NextResponse.json(await saveBuild(user, buildId, await readJson(request)));
});

export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireBuilder();
  const { buildId } = await params;
  return NextResponse.json(await deleteBuild(user, buildId));
});

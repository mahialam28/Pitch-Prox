import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireBuilder } from "@/lib/playbook-builder";
import { listLibrary, pinResource } from "@/lib/playbook-resources";

export const runtime = "nodejs";

// Resource Library: ?search=&type=&addedBy=<user id>
export const GET = withApi(async (request) => {
  await requireBuilder();
  const params = new URL(request.url).searchParams;
  return NextResponse.json(await listLibrary({ search: params.get("search"), type: params.get("type"), addedBy: params.get("addedBy") }));
});

// Pin: { name, type, description?, content?, iconColor?, file? } → 201, or 200 { alreadyPinned: true }
export const POST = withApi(async (request) => {
  const user = await requireBuilder();
  const result = await pinResource(user, await readJson(request));
  return NextResponse.json(result, { status: result.alreadyPinned ? 200 : 201 });
});

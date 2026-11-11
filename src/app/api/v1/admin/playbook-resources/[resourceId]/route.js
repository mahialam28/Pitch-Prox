import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireBuilder } from "@/lib/playbook-builder";
import { removeLibraryResource, updateLibraryResource } from "@/lib/playbook-resources";

export const runtime = "nodejs";

export const PATCH = withApi(async (request, { params }) => {
  const user = await requireBuilder();
  const { resourceId } = await params;
  return NextResponse.json(await updateLibraryResource(user, resourceId, await readJson(request)));
});

// Removes it from the library; playbooks that imported it keep their copy
export const DELETE = withApi(async (_request, { params }) => {
  const user = await requireBuilder();
  const { resourceId } = await params;
  return NextResponse.json(await removeLibraryResource(user, resourceId));
});

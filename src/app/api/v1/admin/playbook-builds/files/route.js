import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { readForm } from "@/lib/storage";
import { requireBuilder, uploadBuilderFile } from "@/lib/playbook-builder";

export const runtime = "nodejs";

// multipart: purpose ("cover" | "asset" | "audio") + file → { file: { id, name, size, type, url } }
export const POST = withApi(async (request) => {
  const user = await requireBuilder();
  return NextResponse.json(await uploadBuilderFile(user, await readForm(request)), { status: 201 });
});

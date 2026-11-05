import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { assertCanWrite, requireSection } from "@/lib/permissions";
import { listOffboarding, startOffboarding } from "@/lib/offboarding";

export const runtime = "nodejs";

export const GET = withApi(async () => {
  await requireSection("compliance");
  return NextResponse.json(await listOffboarding());
});

// { userId, lastDay: "YYYY-MM-DD", ownerId?, reason? }
export const POST = withApi(async (request) => {
  const user = await requireSection("compliance");
  assertCanWrite(user);
  return NextResponse.json({ case: await startOffboarding(user, await readJson(request)) }, { status: 201 });
});

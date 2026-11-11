import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { getVersion, requireBuilder } from "@/lib/playbook-builder";

export const runtime = "nodejs";

// The compiled PremiumPlaybook object of one published version
export const GET = withApi(async (_request, { params }) => {
  await requireBuilder();
  const { playbookId, version } = await params;
  return NextResponse.json(await getVersion(playbookId, version));
});

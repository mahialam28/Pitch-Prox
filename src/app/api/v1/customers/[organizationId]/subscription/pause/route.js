import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, getAccountDetail, pauseSubscription } from "@/lib/accounts";

export const runtime = "nodejs";

// { until: "YYYY-MM-DD" } or { resume: true }
export const POST = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  await pauseSubscription(context, await readJson(request));
  return NextResponse.json(await getAccountDetail(context));
});

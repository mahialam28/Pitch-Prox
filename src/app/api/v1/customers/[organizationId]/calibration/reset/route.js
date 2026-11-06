import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireAccountAccess, resetCalibration } from "@/lib/accounts";

export const runtime = "nodejs";

export const POST = withApi(async (_request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  return NextResponse.json(await resetCalibration(context));
});

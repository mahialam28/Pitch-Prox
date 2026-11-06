import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, getAccountDetail, updateOwner } from "@/lib/accounts";

export const runtime = "nodejs";

// Account owner: { name, email }
export const PATCH = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  await updateOwner(context, await readJson(request));
  return NextResponse.json(await getAccountDetail(context));
});

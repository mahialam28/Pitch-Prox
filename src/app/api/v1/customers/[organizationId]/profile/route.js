import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireAccountAccess, getAccountDetail, updateProfile } from "@/lib/accounts";

export const runtime = "nodejs";

// Company profile: { company?, phone?, country?, industry?, website?, address?, timezone?, companySize?, billingEmail?, seats? }
export const PATCH = withApi(async (request, { params }) => {
  const context = await requireAccountAccess((await params).organizationId, { write: true });
  await updateProfile(context, await readJson(request));
  return NextResponse.json(await getAccountDetail(context));
});

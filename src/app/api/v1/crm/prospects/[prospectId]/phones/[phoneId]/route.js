import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { assertCanWrite } from "@/lib/permissions";
import { requireProspect } from "@/lib/prospects";
import { setPhoneStatus } from "@/lib/phones";

export const runtime = "nodejs";

// One number of a prospect: { status?, called? } — e.g. "bad" after a call; the other numbers stay callable
export const PATCH = withApi(async (request, { params }) => {
  const { user, prospect } = await requireProspect(params);
  assertCanWrite(user);
  const { phoneId } = await params;
  const body = await readJson(request);
  return NextResponse.json({ phones: await setPhoneStatus(user, "prospect", prospect.id, phoneId, { status: body.status, called: body.called === true }) });
});

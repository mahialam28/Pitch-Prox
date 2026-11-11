import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { readJson, withApi } from "@/lib/api";
import { deleteDraft, getMail, updateDraft } from "@/lib/mail";
import { CUSTOMER_ROLES, STAFF_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

const signedIn = () => requireRole(...CUSTOMER_ROLES, ...STAFF_ROLES);

export const GET = withApi(async (_request, { params }) => {
  const user = await signedIn();
  const { messageId } = await params;
  return NextResponse.json({ message: await getMail(user, messageId) });
});

// Your own draft: { to, cc, bcc, subject, body, trackOpens, send? } — send: true sends it
export const PATCH = withApi(async (request, { params }) => {
  const user = await signedIn();
  const { messageId } = await params;
  return NextResponse.json({ message: await updateDraft(user, messageId, await readJson(request)) });
});

// Your own draft only; sent emails stay on record
export const DELETE = withApi(async (_request, { params }) => {
  const user = await signedIn();
  const { messageId } = await params;
  return NextResponse.json(await deleteDraft(user, messageId));
});

import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { buildFollowUpDraft } from "@/lib/follow-up";

export const runtime = "nodejs";

// { templateId, contactId?, contactKind?, phoneNumber?, leadName?, facts?, timeZone? } → { to, subject, body, leftOut }
// Only drafts: nothing is saved or sent here. The user edits and sends it from Mail.
export const POST = withApi(async (request) => NextResponse.json(await buildFollowUpDraft(await readJson(request))));

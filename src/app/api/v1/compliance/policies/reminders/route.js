import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireComplianceWriter, sendReminders } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// { userIds?: [] } — remind those employees (default: everyone overdue). Emails wait in the outbox
// until an email service is connected.
export const POST = withApi(async (request) => {
  const user = await requireComplianceWriter();
  const { userIds } = await readJson(request);
  return NextResponse.json(await sendReminders(user, userIds));
});

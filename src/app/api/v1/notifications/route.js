import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications";

export const runtime = "nodejs";

// The signed-in person's notifications: ?limit=30&before=<createdAt>&unread=1
export const GET = withApi(async (request) => {
  const user = await requireCurrentUser();
  const params = new URL(request.url).searchParams;
  return NextResponse.json(await listNotifications(user, { limit: params.get("limit"), before: params.get("before"), unread: params.get("unread") === "1" }));
});

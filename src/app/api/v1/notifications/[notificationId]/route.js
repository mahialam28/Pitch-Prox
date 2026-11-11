import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { deleteNotification, setRead } from "@/lib/notifications";

export const runtime = "nodejs";

// { read: true | false }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireCurrentUser();
  const { notificationId } = await params;
  const { read = true } = await readJson(request);
  return NextResponse.json(await setRead(user, notificationId, read !== false));
});

export const DELETE = withApi(async (request, { params }) => {
  const user = await requireCurrentUser();
  const { notificationId } = await params;
  return NextResponse.json(await deleteNotification(user, notificationId));
});

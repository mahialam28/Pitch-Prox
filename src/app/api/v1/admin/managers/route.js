import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { listManagers } from "@/lib/staff";

export const runtime = "nodejs";

// Active employees, for "manager" / "owner" pickers
export const GET = withApi(async () => {
  await requireStaff();
  return NextResponse.json({ results: await listManagers() });
});

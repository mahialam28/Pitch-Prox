import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireSection } from "@/lib/permissions";
import { employeeStats } from "@/lib/staff";

export const runtime = "nodejs";
export const GET = withApi(async () => {
  await requireSection("compliance");
  return NextResponse.json(await employeeStats());
});

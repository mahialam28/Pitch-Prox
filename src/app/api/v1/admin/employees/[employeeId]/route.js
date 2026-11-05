import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { assertCanWrite, requireSection } from "@/lib/permissions";
import { getEmployee, updateEmployee } from "@/lib/staff";

export const runtime = "nodejs";

export const GET = withApi(async (request, { params }) => {
  await requireSection("compliance");
  const { employeeId } = await params;
  return NextResponse.json({ employee: await getEmployee(employeeId) });
});

// { role?, managerId?, department?, jobTitle?, phone?, timezone?, status?: "active" | "deactivated" }
export const PATCH = withApi(async (request, { params }) => {
  const user = await requireSection("compliance");
  assertCanWrite(user);
  const { employeeId } = await params;
  return NextResponse.json({ employee: await updateEmployee(user, employeeId, await readJson(request)) });
});

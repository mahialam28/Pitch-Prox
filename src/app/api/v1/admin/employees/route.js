import { NextResponse } from "next/server";
import { readJson, withApi } from "@/lib/api";
import { listParams } from "@/lib/listing";
import { assertCanWrite, requireSection } from "@/lib/permissions";
import { EMPLOYEE_SORTS, inviteEmployee, listEmployees } from "@/lib/staff";

export const runtime = "nodejs";

// Access Records: ?tab=all|pending|in-progress|completed|expired&role=&status=&mfa=enabled|disabled&search=&page=&pageSize=&sort=&dir=
export const GET = withApi(async (request) => {
  await requireSection("compliance");
  const { searchParams } = new URL(request.url);
  const params = listParams(searchParams, { sortable: EMPLOYEE_SORTS, defaultSort: "created" });
  return NextResponse.json(
    await listEmployees({ ...params, tab: searchParams.get("tab") ?? "all", role: searchParams.get("role") || null, status: searchParams.get("status") || null, mfa: searchParams.get("mfa") || null })
  );
});

// Add Employee: creates the account and returns a one-time activation link
export const POST = withApi(async (request) => {
  const user = await requireSection("compliance");
  assertCanWrite(user);
  return NextResponse.json(await inviteEmployee(user, await readJson(request)), { status: 201 });
});

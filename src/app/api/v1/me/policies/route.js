import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { myPolicies } from "@/lib/compliance/policies";

export const runtime = "nodejs";

// The signed-in employee's policies and whether each is signed (after onboarding)
export const GET = withApi(async () => NextResponse.json(await myPolicies(await requireStaff())));

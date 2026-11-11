import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireStaff } from "@/lib/permissions";
import { myTraining } from "@/lib/compliance/training";

export const runtime = "nodejs";

// The signed-in employee's Training with its materials and what they've opened
export const GET = withApi(async () => NextResponse.json(await myTraining(await requireStaff())));

import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCompliance } from "@/lib/compliance/policies";
import { trainingOverview } from "@/lib/compliance/training";

export const runtime = "nodejs";

// Training Logs page: assignments, one row per employee, cards, status totals, upcoming due dates
export const GET = withApi(async () => NextResponse.json(await trainingOverview(await requireCompliance())));

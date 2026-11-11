import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCompliance } from "@/lib/compliance/policies";
import { complianceOverview } from "@/lib/compliance/overview";

export const runtime = "nodejs";

// Compliance Overview: score, KPIs, posture by area, upcoming deadlines, needs attention
export const GET = withApi(async () => NextResponse.json(await complianceOverview(await requireCompliance())));

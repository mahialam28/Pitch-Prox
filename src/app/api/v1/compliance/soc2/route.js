import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { requireCompliance } from "@/lib/compliance/policies";
import { soc2Overview } from "@/lib/compliance/soc2";

export const runtime = "nodejs";

// SOC 2 Readiness: KPIs, Trust Services Criteria, controls, open gaps, audit timeline
export const GET = withApi(async () => NextResponse.json(await soc2Overview(await requireCompliance())));

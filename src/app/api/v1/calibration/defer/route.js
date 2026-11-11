import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { withApi } from "@/lib/api";
import { deferCalibration } from "@/lib/calibration";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

export const runtime = "nodejs";

// "Do it later": no more automatic trip to calibration after sign-in (calling stays locked)
export const POST = withApi(async () => NextResponse.json(await deferCalibration(await requireRole(...CUSTOMER_ROLES))));

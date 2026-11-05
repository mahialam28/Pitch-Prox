import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { ApiError, readJson, withApi } from "@/lib/api";
import { DEMO_ROLES, isDemoMode } from "@/lib/demo";
import { dashboardPathFor } from "@/utils.js/roles";

export const runtime = "nodejs";

// Demo mode only: { role } → signed in as that role's demo account, plus where to go next
export const POST = withApi(async (request) => {
  if (!isDemoMode()) throw new ApiError("Not found.", 404);
  const { role } = await readJson(request);
  const demo = DEMO_ROLES.find((item) => item.key === role);
  if (!demo) throw new ApiError("Choose a role.");
  const [user] = await query(
    "SELECT users.id, users.role, staff_profiles.status AS staffStatus FROM users LEFT JOIN staff_profiles ON staff_profiles.user_id = users.id WHERE users.email = ?",
    [demo.email]
  );
  if (!user) throw new ApiError("Demo data isn't loaded yet. Run `npm run db:seed:demo` against this database.", 503);
  await createSession(user.id);
  const onboarding = user.staffStatus === "invited" || user.staffStatus === "onboarding";
  return NextResponse.json({ redirectTo: onboarding ? "/onboarding" : dashboardPathFor(user.role) });
});

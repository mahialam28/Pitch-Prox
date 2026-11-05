import { requireCurrentUser } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { STAFF_ROLES, canAccessSection } from "@/utils.js/roles";

// API permission checks for the Super Admin portal. They use the same section
// list as the sidebar (utils.js/roles → ADMIN_SECTIONS), so a role can only
// load data for the pages it can open.

// Signed-in admin-portal user whose role includes `section`
export async function requireSection(section) {
  const user = await requireCurrentUser();
  if (!canAccessSection(user.role, section)) throw new Error("FORBIDDEN");
  return user;
}

// Any PitchProX employee (admin roles and sales reps)
export async function requireStaff() {
  const user = await requireCurrentUser();
  if (!STAFF_ROLES.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

// Auditors can read compliance data but never change it
export function assertCanWrite(user) {
  if (user.role === "auditor") throw new Error("FORBIDDEN");
}

// Employee who is still going through onboarding (invited or onboarding)
export async function requireOnboarding() {
  const user = await requireCurrentUser();
  if (!STAFF_ROLES.includes(user.role)) throw new Error("FORBIDDEN");
  if (user.staffStatus !== "invited" && user.staffStatus !== "onboarding") throw new ApiError("Your onboarding is already complete.", 409);
  return user;
}

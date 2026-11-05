// Design preview version of lib/auth.js: no database. The "session" cookie just names
// the role being previewed (set by the sign-in page), and the user comes from personas.js.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PERSONAS } from "@/preview/personas";
import { PORTAL_ROLES, dashboardPathFor } from "@/utils.js/roles";

export const SESSION_COOKIE = "pitchprox_session";

export async function getCurrentUser() {
  const store = await cookies();
  const persona = PERSONAS[store.get(SESSION_COOKIE)?.value];
  if (!persona) return null;
  let identity = null;
  try { identity = JSON.parse(store.get("pitchprox_preview_identity")?.value ?? "null"); } catch { identity = null; }
  return { ...persona.user, ...(identity ?? {}) };
}

export const isOnboarding = (user) => user?.staffStatus === "invited" || user?.staffStatus === "onboarding";

export async function guardPortal(portal) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!PORTAL_ROLES[portal].includes(user.role)) redirect(dashboardPathFor(user.role) ?? "/sign-in");
  if (isOnboarding(user)) redirect("/onboarding");
  return user;
}

export async function redirectIfSignedIn() {
  const user = await getCurrentUser();
  const path = isOnboarding(user) ? "/onboarding" : dashboardPathFor(user?.role);
  if (path) redirect(path);
}

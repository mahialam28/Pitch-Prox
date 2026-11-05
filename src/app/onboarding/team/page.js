import { redirect } from "next/navigation";
import { getCurrentUser, isOnboarding } from "@/lib/auth";
import { ADMIN_ROLES, dashboardPathFor } from "@/utils.js/roles";
import OnboardingFlow from "../components/onboarding-flow";

export const metadata = { title: "Onboarding | PitchProX" };

// Admin preview of the onboarding for non-sales staff (no voice calibration)
export default async function TeamOnboardingPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (isOnboarding(user)) redirect("/onboarding");
  if (ADMIN_ROLES.includes(user.role)) return <OnboardingFlow variant="team" />;
  redirect(dashboardPathFor(user.role) ?? "/sign-in");
}

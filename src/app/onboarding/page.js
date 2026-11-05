import { redirect } from "next/navigation";
import { getCurrentUser, isOnboarding } from "@/lib/auth";
import { ADMIN_ROLES, ROLES, dashboardPathFor } from "@/utils.js/roles";
import OnboardingFlow from "./components/onboarding-flow";

export const metadata = { title: "Onboarding | PitchProX" };

// New employees: their own onboarding (saved). Admins: a preview of the sales rep
// flow (nothing saved). Everyone else goes to their dashboard.
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (isOnboarding(user)) return <OnboardingFlow variant={user.role === ROLES.SALES_REP ? "sales-rep" : "team"} live />;
  if (ADMIN_ROLES.includes(user.role)) return <OnboardingFlow variant="sales-rep" />;
  redirect(dashboardPathFor(user.role) ?? "/sign-in");
}

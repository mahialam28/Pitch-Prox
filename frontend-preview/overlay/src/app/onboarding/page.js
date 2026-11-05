import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import OnboardingFlow from "./components/onboarding-flow";

export const metadata = { title: "Onboarding | PitchProX" };

// Design preview: the onboarding steps with sample data (nothing is saved)
export default async function OnboardingPage() {
  if (!(await getCurrentUser())) redirect("/sign-in");
  return <OnboardingFlow variant="sales-rep" />;
}

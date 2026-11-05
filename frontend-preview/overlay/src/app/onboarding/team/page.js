import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import OnboardingFlow from "../components/onboarding-flow";

export const metadata = { title: "Onboarding | PitchProX" };

export default async function TeamOnboardingPreviewPage() {
  if (!(await getCurrentUser())) redirect("/sign-in");
  return <OnboardingFlow variant="team" />;
}

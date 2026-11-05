import { notFound } from "next/navigation";
import { DEMO_ROLES, isDemoMode } from "@/lib/demo";
import DemoPicker from "./demo-picker";

export const dynamic = "force-dynamic";
export const metadata = { title: "PitchProX — Preview" };

// Client preview: choose a role and look around (only when DEMO_MODE=true)
export default function DemoPage() {
  if (!isDemoMode()) notFound();
  return <DemoPicker roles={DEMO_ROLES.map(({ key, label, description }) => ({ key, label, description }))} />;
}

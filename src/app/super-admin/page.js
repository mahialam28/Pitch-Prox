import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { dashboardPathFor } from "@/utils.js/roles";

// Each role's own home: Support → Support Dashboard, Auditor → Compliance Overview, others → Dashboard
export default async function SuperAdminPage() {
  const user = await getCurrentUser();
  redirect((user && dashboardPathFor(user.role)) || "/super-admin/dashboard");
}

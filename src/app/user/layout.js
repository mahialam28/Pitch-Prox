import { guardPortal } from "@/lib/auth";
import PortalShell from "./portal-shell";

// Server-side guard: only roles that belong to this portal get past here.
export default async function Layout({ children }) {
  const user = await guardPortal("user");
  return <PortalShell user={user}>{children}</PortalShell>;
}

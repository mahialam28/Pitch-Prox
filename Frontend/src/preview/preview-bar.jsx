"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Repeat } from "lucide-react";
import { PERSONAS, personaFromCookie } from "./personas";
import { resetPreviewData } from "./mock-api";

const PORTALS = ["/user", "/internal-sales-representative", "/super-admin", "/onboarding"];
const noSubscribe = () => () => {};

// Small floating button on every app page: which role is being previewed, and a way back to pick another
export default function PreviewBar() {
  const pathname = usePathname() || "";
  // Read the cookie only in the browser (the server renders without the role name, so they match)
  const persona = useSyncExternalStore(noSubscribe, personaFromCookie, () => null);
  if (!PORTALS.some((portal) => pathname.startsWith(portal))) return null;
  const switchRole = () => {
    document.cookie = "pitchprox_session=; path=/; max-age=0";
    document.cookie = "pitchprox_preview_identity=; path=/; max-age=0";
    resetPreviewData();
    window.location.assign("/sign-in");
  };
  return (
    <button
      type="button"
      onClick={switchRole}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-dark-black/90 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-dark-black cursor-pointer"
      title="Design preview with sample data. Click to choose another role."
    >
      <Repeat className="w-3.5 h-3.5" />
      <span>Design preview{persona ? ` · ${PERSONAS[persona].label}` : ""} · Switch role</span>
    </button>
  );
}

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle, Clock, Eye, X } from "lucide-react";
import { pageStatusFor } from "@/utils.js/page-status";

// Look of each status; "working" pages show no banner at all
const STYLES = {
  partial: { label: "Partly working", icon: AlertTriangle, box: "border-amber-300 bg-amber-50 text-amber-950", iconClass: "text-amber-600" },
  waiting: { label: "Waiting on client", icon: Clock, box: "border-orange-300 bg-orange-50 text-orange-950", iconClass: "text-orange-600" },
  preview: { label: "Preview", icon: Eye, box: "border-sky-300 bg-sky-50 text-sky-950", iconClass: "text-sky-600" },
};

export default function DevelopmentNotice() {
  const pathname = usePathname();
  // Closing hides the banner for this page only; it returns on the next page
  const [dismissedPath, setDismissedPath] = useState(null);
  // Phones show a small tag in the corner (so it never covers buttons like End Call); tapping opens it
  const [expandedPath, setExpandedPath] = useState(null);
  const { status, message } = pageStatusFor(pathname);
  const style = STYLES[status];

  if (!style || dismissedPath === pathname) return null;
  const Icon = style.icon;
  const expanded = expandedPath === pathname;

  return (
    <>
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpandedPath(pathname)}
          className={`sm:hidden fixed bottom-3 left-3 z-40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-md cursor-pointer ${style.box}`}
          aria-label={`${style.label}: show details`}
        >
          <Icon className={`h-3.5 w-3.5 ${style.iconClass}`} aria-hidden="true" />
          {style.label}
        </button>
      )}
      <div
        className={`${expanded ? "flex" : "hidden sm:flex"} fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${style.box}`}
        role="status"
      >
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} aria-hidden="true" />
        <p className="flex-1 text-sm leading-5">
          <span className="font-bold">{style.label}:</span> {message}
        </p>
        <button
          type="button"
          onClick={() => (expanded ? setExpandedPath(null) : setDismissedPath(pathname))}
          className="-mr-1 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 cursor-pointer"
          aria-label="Hide this notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

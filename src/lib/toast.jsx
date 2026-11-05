"use client";

import toast from "react-hot-toast";
import { Check, X } from "lucide-react";

// Success toast from the design ("Changes saved", "Draft saved"): check badge, title, message, close.
export function showSavedToast(title, message) {
  return toast.custom(
    (t) => (
      <div
        className={`w-[400px] max-w-[calc(100vw-2rem)] flex items-center gap-4 bg-white rounded-xl px-4 py-3.5 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] border border-gray-100 font-secondary transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark-black leading-5">{title}</p>
          {message && <p className="text-xs text-medium-black leading-4 mt-0.5">{message}</p>}
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => toast.dismiss(t.id)}
          className="p-1 rounded-md text-dark-black/70 hover:text-dark-black hover:bg-light-gray cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ),
    { duration: 4000 }
  );
}

// "Export started" toast from the export dialogs (files are emailed when ready).
export const showExportStartedToast = () => showSavedToast("Export started", "We will email you when your file is ready.");

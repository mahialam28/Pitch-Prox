"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { PERSONAS } from "./personas";
import { resetPreviewData } from "./mock-api";
import { dashboardPathFor } from "@/utils.js/roles";

const setPreviewSession = (key) => {
  document.cookie = `pitchprox_session=${key}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  document.cookie = "pitchprox_preview_identity=; path=/; max-age=0";
};

// Sign-in page: open the app as any role with one click (design preview only)
export default function PreviewRoles() {
  const [opening, setOpening] = useState(null);
  const open = (key) => {
    setOpening(key);
    resetPreviewData();
    setPreviewSession(key);
    const user = PERSONAS[key].user;
    window.location.assign(user.staffStatus === "onboarding" ? "/onboarding" : dashboardPathFor(user.role));
  };

  return (
    <div className="mt-8 border-t border-light-gray pt-6">
      <p className="text-sm font-semibold text-dark-black text-center">Preview the app as a role</p>
      <p className="text-xs text-medium-black text-center mt-1">
        Or sign in above with any email and password (opens the User portal).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
        {Object.entries(PERSONAS).map(([key, persona]) => (
          <button
            key={key}
            type="button"
            onClick={() => open(key)}
            disabled={Boolean(opening)}
            title={persona.description}
            className="group flex items-center justify-between gap-2 rounded-xl border border-light-gray bg-white px-3.5 py-2.5 text-left text-sm font-semibold text-dark-black hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            <span className="truncate">{persona.label}</span>
            {opening === key ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <ArrowRight className="w-4 h-4 shrink-0 text-light-black group-hover:text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

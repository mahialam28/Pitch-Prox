"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Shown across the customer portal while a staff member is impersonating this customer.
// `impersonation` comes from the session: { access: "full" | "readonly", expiresAt, staffName }.
export default function ImpersonationBar({ user }) {
  const [leaving, setLeaving] = useState(false);
  const impersonation = user?.impersonation;
  if (!impersonation) return null;
  const readOnly = impersonation.access === "readonly";
  const endsAt = impersonation.expiresAt ? new Date(impersonation.expiresAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;

  const exit = async () => {
    setLeaving(true);
    try {
      const result = await apiRequest("/api/v1/auth/impersonation", { method: "DELETE" });
      window.location.assign(result.redirectTo);
    } catch (error) {
      setLeaving(false);
      showError("Couldn't end impersonation", error.message);
    }
  };

  return (
    <div role="status" className="w-full flex flex-col sm:flex-row sm:items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 sm:px-6 py-2.5 font-secondary">
      <Eye className="w-5 h-5 text-amber-700 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dark-black">
          {impersonation.staffName}, you are viewing {user.name}&apos;s account ({readOnly ? "Read Only" : "Full Access"})
        </p>
        <p className="text-xs text-medium-black">
          {endsAt ? `Session ends at ${endsAt}. ` : ""}
          {readOnly ? "You can look around but not change anything." : "Changes you make are logged under your name."}
        </p>
      </div>
      <button
        type="button"
        onClick={exit}
        disabled={leaving}
        className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-60"
      >
        {leaving ? "Leaving…" : "Exit impersonation"}
      </button>
    </div>
  );
}

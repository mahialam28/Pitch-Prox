"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export default function IncidentBanner() {
  return (
    <div className="w-full bg-[#EBF7F7]/70 border border-[#D5EFEF] rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 shadow-2xs">
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-white border border-[#C2E8E7] flex items-center justify-center text-primary shrink-0 shadow-2xs">
        <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-bold text-dark-black font-secondary">
          Need to report an incident?
        </h4>
        <p className="text-xs text-medium-black">
          Use the &ldquo;Report Incident&rdquo; button to log a new security, compliance, or operational issue.
        </p>
      </div>
    </div>
  );
}

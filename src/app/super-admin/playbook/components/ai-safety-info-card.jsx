"use client";

import React from "react";
import { Clock, ShieldCheck, CheckCircle } from "lucide-react";

export default function AiSafetyInfoCard() {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-6">
      {/* ── 1. Why it matters ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0 stroke-[2.2]" />
          <h3 className="text-xs sm:text-sm font-bold text-primary font-secondary">
            Why it matters
          </h3>
        </div>
        <p className="text-xs text-medium-black leading-relaxed font-normal">
          Guardrails protect your team, your clients, and your brand. They ensure every prompt is safe, compliant, and aligned with best practices.
        </p>
      </div>

      {/* ── 2. Always On ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary shrink-0 stroke-[2.2]" />
          <h3 className="text-xs sm:text-sm font-bold text-primary font-secondary">
            Always On
          </h3>
        </div>
        <p className="text-xs text-medium-black leading-relaxed font-normal">
          These guardrails apply to every prompt in every call.
        </p>
      </div>
    </div>
  );
}


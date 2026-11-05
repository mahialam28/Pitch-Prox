"use client";

import React from "react";
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

const AiSafetyScoreCard = ({
  prohibitedCount = 5,
  hallucinationMode = "strict-grounded",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
            Guardrails & Compliance
          </h3>
          <p className="text-[11px] text-light-black font-normal">
            Automated boundary enforcement
          </p>
        </div>
      </div>

      {/* Primary Score Tile */}
      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-emerald-800 font-semibold">
            Compliance Safety Score
          </div>
          <div className="text-xl font-bold text-emerald-700 font-secondary mt-0.5">
            100% (Grade A+)
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-2xs font-bold text-sm">
          A+
        </div>
      </div>

      {/* Protections Active */}
      <div className="space-y-2.5 pt-1 text-xs">
        <div className="flex items-center gap-2 text-dark-black/90 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{prohibitedCount} Prohibited Claims Blocked</span>
        </div>
        <div className="flex items-center gap-2 text-dark-black/90 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Mandatory Regulatory Disclosures Active</span>
        </div>
        <div className="flex items-center gap-2 text-dark-black/90 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Anti-Hallucination Grounding: Strict</span>
        </div>
        <div className="flex items-center gap-2 text-dark-black/90 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profanity & Aggressive Tone Filter: ON</span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 rounded-xl bg-light-gray/40 border border-light-gray text-[11px] text-medium-black leading-relaxed">
        <Lock className="w-3.5 h-3.5 inline mr-1 text-primary" />
        Prompts will never generate unauthorized promises, ungrounded figures, or high-pressure manipulative claims.
      </div>
    </div>
  );
};

export default AiSafetyScoreCard;

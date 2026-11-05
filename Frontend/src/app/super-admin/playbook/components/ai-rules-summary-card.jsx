"use client";

import React from "react";
import { GitBranch, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

const AiRulesSummaryCard = ({
  totalRules = 4,
  totalConstraints = 3,
  activeTriggers = 6,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
          <GitBranch className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
            Logic Engine Status
          </h3>
          <p className="text-[11px] text-light-black font-normal">
            Real-time rule evaluation health
          </p>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100">
          <div className="text-lg font-bold text-primary font-secondary">
            {totalRules}
          </div>
          <div className="text-[10px] text-light-black font-medium mt-0.5">
            Active Rules
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
          <div className="text-lg font-bold text-blue-600 font-secondary">
            {totalConstraints}
          </div>
          <div className="text-[10px] text-light-black font-medium mt-0.5">
            Constraints
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
          <div className="text-lg font-bold text-purple-600 font-secondary">
            {activeTriggers}
          </div>
          <div className="text-[10px] text-light-black font-medium mt-0.5">
            Cues Active
          </div>
        </div>
      </div>

      {/* Validation Checklist */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-dark-black/90">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>0 Logic Conflicts Detected</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-dark-black/90">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All 6 Stages Covered by Prompts</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-dark-black/90">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Hard Constraints Prioritized Over Soft Cues</span>
        </div>
      </div>

      {/* Execution Priority Notice */}
      <div className="p-3 rounded-xl bg-light-gray/40 border border-light-gray text-[11px] text-medium-black leading-relaxed">
        <strong>Execution Hierarchy:</strong> Safety Constraints &gt; Stage Branching Rules &gt; Adaptive Objection Prompts &gt; General Style Guidance.
      </div>
    </div>
  );
};

export default AiRulesSummaryCard;

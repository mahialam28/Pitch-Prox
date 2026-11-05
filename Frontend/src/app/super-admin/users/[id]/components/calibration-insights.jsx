"use client";

import React from "react";
import { Check, AlertTriangle, RotateCcw } from "lucide-react";

export default function CalibrationInsights() {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-light-gray/70">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-dark-black/85">
            Calibration Insights
          </h3>
          <RotateCcw className="w-3.5 h-3.5 text-light-black/60" />
        </div>
      </div>

      {/* Insights List */}
      <div className="flex flex-col gap-4 text-xs">
        {/* Item 1: Strengths */}
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">
              STRENGTHS
            </span>
            <p className="text-light-black leading-relaxed">
              Excellent control of pitch flow and strong empathy shown throughout calls.
            </p>
          </div>
        </div>

        {/* Item 2: Opportunities */}
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-3 h-3" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">
              OPPORTUNITIES
            </span>
            <p className="text-light-black leading-relaxed">
              Improve closing confidence and ask for commitment more frequently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

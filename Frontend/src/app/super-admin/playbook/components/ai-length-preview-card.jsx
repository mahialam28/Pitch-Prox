"use client";

import React from "react";
import { Eye, Clock, Zap, Gauge } from "lucide-react";

const AiLengthPreviewCard = ({
  brevityMode = "punchy-bullet",
  maxWordCount = 25,
  wpmTarget = 140,
}) => {
  const estimatedReadingTime = ((maxWordCount / wpmTarget) * 60).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
          <Gauge className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
            Glanceability Index
          </h3>
          <p className="text-[11px] text-light-black font-normal">
            Real-time rep cognitive load metrics
          </p>
        </div>
      </div>

      {/* Primary Metric Tile */}
      <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-light-black font-semibold">
            Avg. Rep Glance Time
          </div>
          <div className="text-xl font-bold text-primary font-secondary mt-0.5">
            {estimatedReadingTime}s
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
          Optimal
        </span>
      </div>

      {/* Metrics List */}
      <div className="space-y-2.5 pt-1 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-light-gray/60">
          <span className="text-medium-black">Target Pacing</span>
          <span className="font-bold text-dark-black/90">{wpmTarget} WPM</span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-light-gray/60">
          <span className="text-medium-black">Token Cap</span>
          <span className="font-bold text-dark-black/90">{maxWordCount} Words Max</span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-light-gray/60">
          <span className="text-medium-black">Cognitive Load</span>
          <span className="font-bold text-emerald-600">Low (Instant Glance)</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-medium-black">Format Style</span>
          <span className="font-bold text-primary capitalize">
            {brevityMode.replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Simulated Glance Box */}
      <div className="p-3 rounded-xl bg-light-gray/40 border border-light-gray space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-medium-black uppercase tracking-wider">
          <Eye className="w-3 h-3 text-primary" />
          <span>Teleprompter Glance Preview</span>
        </div>
        <p className="text-xs text-dark-black/90 font-semibold italic">
          &quot;Price objection? Ask: &apos;What is leaving this unsolved costing you each month?&apos;&quot;
        </p>
      </div>
    </div>
  );
};

export default AiLengthPreviewCard;

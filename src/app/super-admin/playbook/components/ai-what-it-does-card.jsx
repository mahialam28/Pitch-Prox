"use client";

import React from "react";
import { Sparkles, Check } from "lucide-react";

const DEFAULT_FEATURES = [
  {
    title: "Better Timing",
    description: "Prompts appear at the right moment.",
  },
  {
    title: "Smarter Adaptation",
    description: "AI adjusts based on emotion and trust.",
  },
  {
    title: "Fewer False Triggers",
    description: "Set confidence levels to reduce noise.",
  },
  {
    title: "Continuous Improvement",
    description: "Learning mode captures new insights.",
  },
];

const AiWhatItDoesCard = ({
  title = "What it does",
  description = "Advanced settings help you control how PitchProX behaves in real time—giving you precision, better timing, and smarter coaching.",
  features = DEFAULT_FEATURES,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-xs text-medium-black leading-relaxed font-normal">
        {description}
      </p>

      {/* Feature Checklist */}
      <div className="space-y-3.5 pt-1">
        {features.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-teal-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-dark-black/90 font-secondary leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-light-black font-normal mt-0.5 leading-snug">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiWhatItDoesCard;

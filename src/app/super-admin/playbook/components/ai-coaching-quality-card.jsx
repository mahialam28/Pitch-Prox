"use client";

import React from "react";
import { Star, Info } from "lucide-react";

const AiCoachingQualityCard = ({
  score = "4.6",
  status = "Excellent",
  description = "This playbook provides strong objection handling and clear guidance for agents.",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-dark-black/80 font-secondary">
          AI Coaching Quality
        </h3>
        <button
          type="button"
          className="text-light-black hover:text-dark-black transition-colors"
          title="Quality benchmark based on response diversity and prompt clarity"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stars + Score */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-sm font-bold text-dark-black/90 font-secondary">
            {score}
          </span>
          <span className="text-xs font-semibold text-emerald-600">
            {status}
          </span>
        </div>
      </div>

      <p className="text-xs text-medium-black leading-relaxed font-normal pt-1 border-t border-light-gray/60">
        {description}
      </p>
    </div>
  );
};

export default AiCoachingQualityCard;

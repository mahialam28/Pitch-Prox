"use client";

import React from "react";
import { Check } from "lucide-react";

const ResourceTipsCard = () => {
  const tips = [
    "Use real-world examples and proven language",
    "Keep scripts short, natural, and easy to say",
    "Include multiple variations for flexibility",
    "Update regularly based on performance data",
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-3.5">
      <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
        Tips for Great Resources
      </h3>

      <div className="space-y-2.5 text-xs">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span className="text-medium-black font-normal leading-relaxed text-xs">
              {tip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceTipsCard;

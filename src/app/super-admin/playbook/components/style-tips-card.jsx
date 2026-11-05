"use client";

import React from "react";
import { Lightbulb, Check } from "lucide-react";

const StyleTipsCard = () => {
  const tips = [
    "Use no more than 3 tones for best results.",
    "Keep your unique phrases natural and authentic.",
    "Avoid overloading the AI with too many rules.",
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-bold text-dark-black/80 font-secondary">
          Tips
        </h3>
      </div>

      <div className="space-y-2 text-xs">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span className="text-medium-black font-normal leading-relaxed text-[11px]">
              {tip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StyleTipsCard;

"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

const AiProTipCard = ({
  title = "Pro Tip",
  tip = "Start with balanced settings and adjust based on your call style and results.",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-primary" />
        <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
          {title}
        </h3>
      </div>

      {/* Content */}
      <p className="text-xs text-medium-black leading-relaxed font-normal">
        {tip}
      </p>
    </div>
  );
};

export default AiProTipCard;

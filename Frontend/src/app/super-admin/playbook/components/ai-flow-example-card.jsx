"use client";

import React from "react";
import { Play } from "lucide-react";

const AiFlowExampleCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-3">
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
          AI Flow Example
        </h3>
        <p className="text-[11px] text-light-black font-normal mt-0.5">
          See how this flow works in a real conversation.
        </p>
      </div>

      <button
        type="button"
        className="w-full py-2.5 px-4 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Preview Example</span>
      </button>
    </div>
  );
};

export default AiFlowExampleCard;


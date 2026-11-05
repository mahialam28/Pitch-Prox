"use client";

import React from "react";
import { Info } from "lucide-react";

export default function AiPromptLengthInfoCard() {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-5">
      {/* ── 1. Why it matters ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-teal-50 text-primary flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-primary font-secondary">
            Why it matters
          </h3>
        </div>

        <div className="space-y-2 text-xs text-medium-black leading-relaxed font-normal">
          <p>
            Shorter prompts are easier to read, faster to understand, and more likely to drive action.
          </p>
          <p>
            This range is optimized for live conversations and real-time decision making.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-light-gray/70" />

      {/* ── 2. Example Prompt ── */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-primary font-secondary">
          Example Prompt (21 words)
        </h4>
        <p className="text-xs text-dark-black/90 italic leading-relaxed font-normal">
          “I understand your concern. Can I ask what&apos;s most important to you right now so I can address it?”
        </p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Mic, Info } from "lucide-react";

const PromptStylePreviewCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-dark-black font-secondary">
          Prompt Style Preview
        </h2>
        <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
          See how this playbook&apos;s voice shapes the AI prompts.
        </p>
      </div>

      {/* 1. PitchProx Default Prompt Card (Baseline) */}
      <div className="bg-[#0e1726] rounded-2xl p-4 sm:p-4.5 border border-slate-800/80 shadow-inner space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-[13px] font-semibold text-white font-secondary truncate">
              PitchProx Default Prompt
            </span>
            <div className="relative group cursor-pointer shrink-0">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200 transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-52 p-2 bg-slate-900 text-slate-200 text-[10px] rounded-lg shadow-lg z-20 pointer-events-none border border-slate-700">
                Standard baseline AI prompt without custom playbook DNA styling.
              </div>
            </div>
          </div>

          <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/60 shrink-0">
            Baseline
          </span>
        </div>

        <p className="text-xs text-slate-300 italic leading-relaxed font-normal">
          &ldquo;I understand. A lot of sellers feel that way. Would it help if I showed you how the right strategy can improve your result?&rdquo;
        </p>
      </div>

      {/* VS. Divider */}
      <div className="flex items-center gap-3 py-0.5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[11px] font-bold text-medium-black/70 tracking-widest uppercase">
          VS.
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* 2. This Playbook Voice Card */}
      <div className="bg-[#0e1726] rounded-2xl p-4 sm:p-4.5 border border-slate-800/80 shadow-inner space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-[13px] font-semibold text-white font-secondary truncate">
              This Playbook Voice
            </span>
            <div className="relative group cursor-pointer shrink-0">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200 transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-52 p-2 bg-slate-900 text-slate-200 text-[10px] rounded-lg shadow-lg z-20 pointer-events-none border border-slate-700">
                Custom prompt modified by this playbook&apos;s coaching philosophy and tone.
              </div>
            </div>
          </div>

          <span className="text-[10px] font-medium text-teal-400 px-2.5 py-0.5 rounded-full bg-teal-950/90 border border-teal-500/40 shrink-0">
            Your Playbook Style
          </span>
        </div>

        <p className="text-xs text-slate-300 italic leading-relaxed font-normal">
          &ldquo;Totally fair &mdash; and the real question is whether it&apos;s price, presentation, or strategy. Let&apos;s separate those so we can make the smartest move forward.&rdquo;
        </p>
      </div>

      {/* 3. How this works Info Box */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 sm:p-4.5 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-teal-100 text-primary flex items-center justify-center shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            How this works
          </h3>
        </div>

        <p className="text-xs text-medium-black leading-relaxed font-normal">
          PitchProx decides when and why to prompt based on real-time conversation intelligence, trust score, call stage, and objections.
        </p>

        <p className="text-xs text-primary font-medium leading-relaxed pt-1">
          This playbook controls how the prompt sounds, what it emphasizes, and the strategic lens it uses.
        </p>
      </div>
    </div>
  );
};

export default PromptStylePreviewCard;

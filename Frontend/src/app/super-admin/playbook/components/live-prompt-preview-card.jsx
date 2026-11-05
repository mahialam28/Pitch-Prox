"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const PROMPT_PREVIEWS = [
  {
    tones: ["Confident", "Consultative"],
    prompt:
      "“Totally get it—commission concerns are real. Most owners I speak with felt the same way before we looked at what their home is worth in today's market. Would it help if I showed you how my approach can actually put more money in your pocket compared to selling on your own?”",
    wordCount: 28,
  },
  {
    tones: ["Direct", "Value-Driven"],
    prompt:
      "“I understand completely. At the end of the day, numbers don't lie. When we factor in average days on market and escrow fees, our net proceeds are 8% higher. Would you be open to seeing the comparison breakdown?”",
    wordCount: 31,
  },
];

export default function LivePromptPreviewCard() {
  const [index, setIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const current = PROMPT_PREVIEWS[index];

  const handleRegenerate = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % PROMPT_PREVIEWS.length);
      setIsRefreshing(false);
      toast.success("Regenerated prompt preview!");
    }, 300);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* ── Card Header ── */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-dark-black font-secondary">
          Live Prompt Preview
        </h3>
        <p className="text-xs text-medium-black mt-0.5 font-normal">
          See how the AI will prompt using this framework.
        </p>
      </div>

      {/* ── Dark Teleprompter HUD Box ── */}
      <div className="bg-[#0B132B] rounded-2xl p-4 sm:p-5 text-white space-y-3.5 shadow-md border border-slate-800">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-slate-200">
              Live Prompt Example
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {current.tones.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Prompt Text */}
        <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-normal">
          {current.prompt}
        </p>

        {/* Bottom Audio Waveform + Word Count Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
          {/* Animated Audio Waveform Bars */}
          <div className="flex items-center gap-1 h-4">
            {[40, 70, 90, 50, 100, 60, 80, 45, 95, 65, 30].map((h, i) => (
              <motion.span
                key={i}
                animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.4}%`] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
                className="w-0.5 bg-teal-400/80 rounded-full"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <span className="font-mono text-slate-400 text-[11px]">
            {current.wordCount} words
          </span>
        </div>
      </div>

      {/* ── Regenerate Button ── */}
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={isRefreshing}
        className="w-full py-2.5 rounded-xl border border-light-gray hover:border-primary/50 bg-white hover:bg-teal-50/20 text-medium-black hover:text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
        />
        <span>Regenerate Example</span>
      </button>
    </div>
  );
}

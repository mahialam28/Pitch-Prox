"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, X, Layers, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SAMPLE_EXAMPLES = [
  {
    leadType: "Expired",
    stage: "Objection Handling",
    objection: "I don't want to pay commission",
    leadEmotion: "Skeptical",
    trustScore: "42/100",
    agentTone: "Confident",
    textSegments: [
      { text: "“", isHighlight: false },
      { text: "Totally get it—", isHighlight: true, color: "bg-pink-100 text-pink-700 border border-pink-200/50", label: "Acknowledge (Empathy)" },
      { text: " ", isHighlight: false },
      { text: "commission concerns are real.", isHighlight: true, color: "bg-emerald-100 text-emerald-700 border border-emerald-200/50", label: "Acknowledge (Validation)" },
      { text: " Most owners I speak with felt the same way before we looked at ", isHighlight: false },
      { text: "what their home is worth in today's market.", isHighlight: true, color: "bg-purple-100 text-purple-700 border border-purple-200/50", label: "Address (Market Anchor)" },
      { text: " ", isHighlight: false },
      { text: "Would it help if", isHighlight: true, color: "bg-emerald-100 text-emerald-700 border border-emerald-200/50", label: "Pivot (Bridge Question)" },
      { text: " I showed you how ", isHighlight: false },
      { text: "my approach can actually put more money in your pocket", isHighlight: true, color: "bg-indigo-100 text-indigo-700 border border-indigo-200/50", label: "Value Proposition (Net Profit)" },
      { text: " compared to selling on your own?”", isHighlight: false },
    ],
  },
  {
    leadType: "FSBO",
    stage: "Discovery & Value",
    objection: "We are trying to sell by ourselves first",
    leadEmotion: "Guarded",
    trustScore: "55/100",
    agentTone: "Consultative",
    textSegments: [
      { text: "“", isHighlight: false },
      { text: "I respect that completely—", isHighlight: true, color: "bg-pink-100 text-pink-700 border border-pink-200/50", label: "Acknowledge" },
      { text: " saving on fees makes total financial sense. ", isHighlight: false },
      { text: "Most FSBO sellers tell me the toughest part is unqualified buyers wasting their weekends.", isHighlight: true, color: "bg-purple-100 text-purple-700 border border-purple-200/50", label: "Address Pain" },
      { text: " ", isHighlight: false },
      { text: "If I could bring a pre-screened cash buyer tomorrow,", isHighlight: true, color: "bg-emerald-100 text-emerald-700 border border-emerald-200/50", label: "Pivot" },
      { text: " would you be open to a 10-minute walkthrough?”", isHighlight: true, color: "bg-indigo-100 text-indigo-700 border border-indigo-200/50", label: "Next Step" },
    ],
  },
];

export default function PromptExampleSection() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const currentExample = SAMPLE_EXAMPLES[exampleIndex];

  const handleGenerateExample = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setExampleIndex((prev) => (prev + 1) % SAMPLE_EXAMPLES.length);
      setIsRegenerating(false);
      toast.success("New prompt example generated!");
    }, 350);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            4
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-dark-black font-secondary flex items-center gap-1.5">
              Prompt Example
              <span className="text-light-black font-normal text-xs sm:text-sm">
                (How the AI will respond)
              </span>
            </h3>
            <p className="text-xs text-medium-black mt-0.5 font-normal">
              See an example of how the AI builds a prompt using this framework.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateExample}
          disabled={isRegenerating}
          className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-primary/50 bg-white text-medium-black hover:text-primary text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-primary" : ""}`}
          />
          <span>Generate Example</span>
        </button>
      </div>

      {/* ── Dark Meta Data Row ── */}
      <div className="bg-[#0B132B] rounded-xl px-4 py-2.5 text-white text-[11px] font-medium flex flex-wrap items-center gap-y-1.5 gap-x-3.5 leading-tight">
        <div>
          <span className="text-slate-400">Lead Type:</span>{" "}
          <span className="font-bold text-slate-100">{currentExample.leadType}</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <div>
          <span className="text-slate-400">Stage:</span>{" "}
          <span className="font-bold text-slate-100">{currentExample.stage}</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <div>
          <span className="text-slate-400">Objection:</span>{" "}
          <span className="font-bold text-slate-100">{currentExample.objection}</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <div>
          <span className="text-slate-400">Lead Emotion:</span>{" "}
          <span className="font-bold text-slate-100">{currentExample.leadEmotion}</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <div>
          <span className="text-slate-400">Trust Score:</span>{" "}
          <span className="font-bold text-teal-400">{currentExample.trustScore}</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <div>
          <span className="text-slate-400">Agent Tone:</span>{" "}
          <span className="font-bold text-slate-100">{currentExample.agentTone}</span>
        </div>
      </div>

      {/* ── Prompt Content Box with Highlighted Pills ── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-light-gray bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-dark-black/90 leading-relaxed font-normal flex-1">
          {currentExample.textSegments.map((segment, idx) => {
            if (segment.isHighlight) {
              return (
                <span
                  key={idx}
                  className={`inline-block px-1.5 py-0.5 rounded-md text-[11px] sm:text-xs font-medium mx-0.5 transition-all ${segment.color}`}
                >
                  {segment.text}
                </span>
              );
            }
            return <span key={idx}>{segment.text}</span>;
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsBreakdownOpen(true)}
          className="px-3.5 py-2 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white hover:bg-light-gray/40 text-dark-black text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          View Breakdown
        </button>
      </div>

      {/* ── Breakdown Modal ── */}
      <AnimatePresence>
        {isBreakdownOpen && (
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs"
            onClick={() => setIsBreakdownOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-light-gray overflow-hidden relative my-auto p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-light-gray">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-black font-secondary">
                      Prompt Structure Breakdown
                    </h3>
                    <p className="text-xs text-medium-black">
                      How each phrase aligns with the 4 response pillars.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBreakdownOpen(false)}
                  className="p-1 rounded-lg text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {currentExample.textSegments
                  .filter((s) => s.isHighlight)
                  .map((seg, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-light-gray bg-light-gray/20 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          Pillar: {seg.label}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className={`p-1.5 rounded-lg text-xs font-semibold ${seg.color}`}>
                        &quot;{seg.text}&quot;
                      </div>
                    </div>
                  ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsBreakdownOpen(false)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Close Breakdown
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

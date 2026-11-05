"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Activity,
  Mic,
  Volume2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

const SAMPLE_PROMPTS = [
  {
    stage: "Stage 2: Discovery",
    prospectSaid: "We're currently looking around and comparing other options.",
    suggestedCue:
      "Acknowledge comparison, then ask: 'Totally fair. When comparing, what's the #1 dealbreaker for your team?'",
    confidence: "96%",
    emotion: "Neutral / Analytical",
  },
  {
    stage: "Stage 4: Handle Objections",
    prospectSaid: "Your fee seems higher than what we budgeted for.",
    suggestedCue:
      "Herjavec Value Anchor: 'Price is only an issue in the absence of value. What is it costing you to leave this problem unsolved each month?'",
    confidence: "98%",
    emotion: "Hesitant",
  },
  {
    stage: "Stage 5: Close",
    prospectSaid: "Sounds good, but let me check with my business partner.",
    suggestedCue:
      "Assumptive Schedule: 'Great. Let’s tentatively set a 15-minute sync with both of you on Thursday at 2 PM. If they can’t make it, we’ll adjust.'",
    confidence: "94%",
    emotion: "Interested",
  },
];

const AiPromptSimulatorCard = () => {
  const [promptIdx, setPromptIdx] = useState(1);
  const [copied, setCopied] = useState(false);

  const currentSample = SAMPLE_PROMPTS[promptIdx];

  const handleNextPrompt = () => {
    setPromptIdx((prev) => (prev + 1) % SAMPLE_PROMPTS.length);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSample.suggestedCue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
              Live HUD Simulation
            </h3>
            <p className="text-[11px] text-light-black font-normal">
              Real-time rep teleprompter preview
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextPrompt}
          title="Simulate next call moment"
          className="p-1.5 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black hover:text-dark-black transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live In-Call Mockup Card */}
      <div className="rounded-xl border border-primary/20 bg-linear-to-b from-teal-50/50 to-white p-3.5 sm:p-4 space-y-3 relative overflow-hidden">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-primary px-2 py-0.5 rounded-md bg-teal-100/60">
            {currentSample.stage}
          </span>
          <div className="flex items-center gap-1.5 text-light-black">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Live Audio Stream</span>
          </div>
        </div>

        {/* Prospect Speech Bubble */}
        <div className="bg-white rounded-xl p-3 border border-light-gray shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-light-black uppercase tracking-wider">
            <Mic className="w-3 h-3 text-medium-black" />
            <span>Prospect Just Said:</span>
          </div>
          <p className="text-xs text-dark-black/90 font-medium italic">
            &quot;{currentSample.prospectSaid}&quot;
          </p>
        </div>

        {/* AI Suggested Teleprompter Cue */}
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Recommended Teleprompt</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="text-xs font-semibold text-dark-black/95 leading-relaxed">
            {currentSample.suggestedCue}
          </p>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-light-black font-medium">
          <span>
            Confidence: <strong className="text-primary">{currentSample.confidence}</strong>
          </span>
          <span>
            Detected Emotion: <strong className="text-dark-black/80">{currentSample.emotion}</strong>
          </span>
        </div>
      </div>

      {/* Latency & Metrics */}
      <div className="grid grid-cols-2 gap-2 text-center pt-1">
        <div className="p-2.5 rounded-xl bg-light-gray/30 border border-light-gray">
          <div className="text-[10px] text-light-black font-normal">Latency Target</div>
          <div className="text-xs font-bold text-dark-black/90 mt-0.5">~120ms (Instant)</div>
        </div>
        <div className="p-2.5 rounded-xl bg-light-gray/30 border border-light-gray">
          <div className="text-[10px] text-light-black font-normal">Prompt Brevity</div>
          <div className="text-xs font-bold text-dark-black/90 mt-0.5">High Glanceability</div>
        </div>
      </div>
    </div>
  );
};

export default AiPromptSimulatorCard;

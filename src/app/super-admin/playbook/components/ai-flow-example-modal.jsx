"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Bot,
  User,
  Sparkles,
  Smile,
  Search,
  Gem,
  ShieldCheck,
  Target,
  PhoneCall,
  ChevronRight,
} from "lucide-react";

const FLOW_DEMO_STEPS = [
  {
    stage: "Opening",
    icon: Smile,
    color: "text-emerald-600 bg-emerald-50",
    caller: "Sales Rep",
    callerMsg: "Hi John, this is Robert. I noticed your listing on Oak Street recently expired, and I wanted to reach out directly.",
    aiPrompt: "Lead acknowledged. Keep it confident and consultative. Ask for 60 seconds to share what went wrong before they decide on another agent.",
    prospectMsg: "Yeah, we had several showings, but nobody put in an offer. Not sure what happened.",
  },
  {
    stage: "Discovery",
    icon: Search,
    color: "text-blue-600 bg-blue-50",
    caller: "Sales Rep",
    callerMsg: "That's frustrating after putting in all that effort. What was the main feedback buyers gave your previous agent during showings?",
    aiPrompt: "Great question! Listen closely to see if it was pricing, marketing reach, or staging.",
    prospectMsg: "They mentioned the price was slightly high for the neighborhood, and we didn't get enough digital exposure.",
  },
  {
    stage: "Value Proposition",
    icon: Gem,
    color: "text-purple-600 bg-purple-50",
    caller: "Sales Rep",
    callerMsg: "We use a targeted multi-channel acquisition strategy that specifically isolates qualified buyers before pricing adjustments. Let me explain how our approach fixes that gap.",
    aiPrompt: "Highlight our 14-day speed-to-contract average and targeted buyer matching algorithm.",
    prospectMsg: "That sounds interesting, but we've been burned by empty promises before.",
  },
  {
    stage: "Handle Objections",
    icon: ShieldCheck,
    color: "text-amber-600 bg-amber-50",
    caller: "Sales Rep",
    callerMsg: "I completely respect that caution. You shouldn't take my word for it—let our transparent weekly audit and performance guarantee show you the proof.",
    aiPrompt: "Direct & Empathetic. Pivot now to locking in a brief 10-minute strategy review.",
    prospectMsg: "Fair enough. What does that look like?",
  },
  {
    stage: "Close",
    icon: Target,
    color: "text-teal-600 bg-teal-50",
    caller: "Sales Rep",
    callerMsg: "Let's do a quick 10-minute Zoom tomorrow at 2 PM. I'll show you the exact buyer match heatmap for your property. Does 2 PM or 4 PM work better?",
    aiPrompt: "Closing with alternate-choice scheduling. Maintain calm confidence.",
    prospectMsg: "Tomorrow at 2 PM works. Send me the invite.",
  },
  {
    stage: "Follow Up",
    icon: PhoneCall,
    color: "text-rose-600 bg-rose-50",
    caller: "Sales Rep",
    callerMsg: "Calendar invite and property audit preview sent to your email. Looking forward to our conversation tomorrow!",
    aiPrompt: "Auto-generate confirmation SMS and calendar sync.",
    prospectMsg: "Received, thank you.",
  },
];

const AiFlowExampleModal = ({ isOpen = false, onClose = () => {} }) => {
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = FLOW_DEMO_STEPS[activeStepIdx];
  const IconComp = currentStep.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-white rounded-2xl border border-light-gray shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-light-gray">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
                  AI Conversation Flow Demo
                </h3>
                <p className="text-[11px] text-light-black font-normal mt-0.5">
                  Step through how the 6 conversation stages guide live calls.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper tabs */}
          <div className="flex items-center gap-1.5 p-3 px-5 bg-light-gray/30 border-b border-light-gray overflow-x-auto">
            {FLOW_DEMO_STEPS.map((step, idx) => (
              <button
                key={step.stage}
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeStepIdx === idx
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-white border border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                <span>{idx + 1}. {step.stage}</span>
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Stage Title */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentStep.color}`}>
                <IconComp className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm font-bold text-dark-black/90 font-secondary">
                Stage {activeStepIdx + 1}: {currentStep.stage}
              </h4>
            </div>

            {/* Conversation Flow Mock */}
            <div className="space-y-3 pt-1">
              {/* Rep Dialog */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-light-gray/50 border border-light-gray text-xs text-dark-black/90 max-w-[85%]">
                  <span className="font-semibold text-[10px] text-primary uppercase block mb-1">
                    Rep Response
                  </span>
                  {currentStep.callerMsg}
                </div>
              </div>

              {/* Prospect Dialog */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-dark-black/90 max-w-[85%]">
                  <span className="font-semibold text-[10px] text-sky-700 uppercase block mb-1">
                    Prospect
                  </span>
                  {currentStep.prospectMsg}
                </div>
              </div>

              {/* AI Real-Time Prompt Coach */}
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-primary text-xs font-bold font-secondary">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time AI Coach Guidance</span>
                </div>
                <p className="text-xs text-medium-black leading-relaxed font-normal">
                  {currentStep.aiPrompt}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between p-4 px-6 border-t border-light-gray bg-white">
            <button
              type="button"
              disabled={activeStepIdx === 0}
              onClick={() => setActiveStepIdx((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray disabled:opacity-40 transition-colors cursor-pointer"
            >
              Previous Stage
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeStepIdx < FLOW_DEMO_STEPS.length - 1) {
                  setActiveStepIdx((prev) => prev + 1);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>{activeStepIdx < FLOW_DEMO_STEPS.length - 1 ? "Next Stage" : "Done"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AiFlowExampleModal;

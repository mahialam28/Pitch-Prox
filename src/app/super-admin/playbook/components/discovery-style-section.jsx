"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  Plus,
  Check,
  X,
  Key,
  Search,
  FileText,
  Compass,
} from "lucide-react";
import AddPromptRuleModal from "./add-prompt-rule-modal";
import AddCoachingPillarModal from "./add-coaching-pillar-modal";
import toast from "react-hot-toast";

export const DEFAULT_DISCOVERY_STYLE = {
  goal: "Uncover the real situation, motivations, and constraints so we can position the right solution. Get them talking, not pitching.",
  questionAskingGuidance:
    "Ask fewer, better questions. One at a time. Listen. Reflect. Dig deeper based on their answers. Avoid interrogation.",
  uncoverFocus: [
    "Situation & current state",
    "Motivation & goals",
    "Challenges & frustrations",
    "Constraints & concerns",
    "Decision process",
    "Timeline",
    "Past experience",
    "Definition of success",
  ],
  selectedUncoverFocus: [
    "Situation & current state",
    "Motivation & goals",
    "Challenges & frustrations",
    "Constraints & concerns",
    "Decision process",
    "Timeline",
    "Past experience",
    "Definition of success",
  ],
  questionCharacteristics: [
    "Open-ended",
    "Curiosity-driven",
    "Situational",
    "Specific",
    "Purposeful",
    "Short & clear",
    "One at a time",
    "Follow-up based",
  ],
  selectedCharacteristics: [
    "Open-ended",
    "Curiosity-driven",
    "Situational",
    "Specific",
    "Purposeful",
    "Short & clear",
    "One at a time",
    "Follow-up based",
  ],
  exampleOpeners: [
    "Help me understand your situation a bit better...",
    "Can you walk me through what's happening now?",
    "What's most important for you to get right in this?",
  ],
  avoidList: [
    "Interrogation or rapid-fire questions",
    "Assumptions before facts",
    "Leading or biased questions",
    "Talking too much",
  ],
};

const DISCOVERY_FLOW_STEPS = [
  {
    icon: Key,
    title: "Open the Door",
    description: "Ease in with a simple, low-pressure opener.",
  },
  {
    icon: Search,
    title: "Explore Deeply",
    description: "Ask targeted questions to uncover the truth behind the answer.",
  },
  {
    icon: FileText,
    title: "Reflect Back",
    description: "Mirror key points to show understanding and build trust.",
  },
  {
    icon: Compass,
    title: "Connect the Dots",
    description: "Link their answers to the bigger picture naturally.",
  },
];

const DiscoveryStyleSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults = () => {},
}) => {
  const [uncoverModalOpen, setUncoverModalOpen] = useState(false);
  const [charModalOpen, setCharModalOpen] = useState(false);

  const currentData = {
    ...DEFAULT_DISCOVERY_STYLE,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleToggleUncover = (item) => {
    const prev = currentData.selectedUncoverFocus || [];
    const updated = prev.includes(item)
      ? prev.filter((i) => i !== item)
      : [...prev, item];
    handleFieldChange("selectedUncoverFocus", updated);
  };

  const handleToggleChar = (item) => {
    const prev = currentData.selectedCharacteristics || [];
    const updated = prev.includes(item)
      ? prev.filter((i) => i !== item)
      : [...prev, item];
    handleFieldChange("selectedCharacteristics", updated);
  };

  const handleAddUncover = (item) => {
    const focus = currentData.uncoverFocus || [];
    const sel = currentData.selectedUncoverFocus || [];
    handleFieldChange("uncoverFocus", [...focus, item]);
    handleFieldChange("selectedUncoverFocus", [...sel, item]);
  };

  const handleAddChar = (item) => {
    const chars = currentData.questionCharacteristics || [];
    const sel = currentData.selectedCharacteristics || [];
    handleFieldChange("questionCharacteristics", [...chars, item]);
    handleFieldChange("selectedCharacteristics", [...sel, item]);
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_DISCOVERY_STYLE);
    }
    toast.success("Reset Discovery Style to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Discovery Style
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Define how the AI should help the agent uncover information and guide the conversation.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Define how the AI should help the agent uncover information and guide the conversation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* ── 1. What is the goal of discovery in this playbook? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What is the goal of discovery in this playbook?
        </label>
        <div className="relative">
          <textarea
            value={currentData.goal}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("goal", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.goal || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 2. How should the AI help the agent ask questions? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should the AI help the agent ask questions?
        </label>
        <div className="relative">
          <textarea
            value={currentData.questionAskingGuidance}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("questionAskingGuidance", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.questionAskingGuidance || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 3. What should the AI focus on uncovering? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should the AI focus on uncovering?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.uncoverFocus || []).map((item) => {
            const isSelected = (currentData.selectedUncoverFocus || []).includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => handleToggleUncover(item)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
                <span>{item}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setUncoverModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 4. How should the AI guide the flow of discovery? ── */}
      <div className="space-y-3 pt-1">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should the AI guide the flow of discovery?
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DISCOVERY_FLOW_STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-light-gray bg-white space-y-2 shadow-2xs text-center flex flex-col items-center justify-start"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-dark-black font-secondary">
                  {s.title}
                </h4>
                <p className="text-[11px] text-medium-black leading-snug">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. Question characteristics to prioritize ── */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-baseline gap-1.5">
          <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Question characteristics to prioritize
          </label>
          <span className="text-[11px] text-medium-black font-normal">
            (Select all that apply)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.questionCharacteristics || []).map((item) => {
            const isSelected = (currentData.selectedCharacteristics || []).includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => handleToggleChar(item)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
                <span>{item}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setCharModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 6. Example openers vs What to avoid (2 Columns) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Left Column: Example openers the AI may use */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Example openers the AI may use
          </h3>

          <div className="space-y-2">
            {(currentData.exampleOpeners || []).map((opener, idx) => (
              <p
                key={idx}
                className="text-xs text-medium-black italic font-normal leading-relaxed"
              >
                &ldquo;{opener}&rdquo;
              </p>
            ))}
          </div>
        </div>

        {/* Right Column: What to avoid */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            What to avoid
          </h3>

          <div className="space-y-2">
            {(currentData.avoidList || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-dark-black font-normal"
              >
                <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCoachingPillarModal
        isOpen={uncoverModalOpen}
        onClose={() => setUncoverModalOpen(false)}
        onAdd={handleAddUncover}
      />

      <AddCoachingPillarModal
        isOpen={charModalOpen}
        onClose={() => setCharModalOpen(false)}
        onAdd={handleAddChar}
      />
    </div>
  );
};

export default DiscoveryStyleSection;

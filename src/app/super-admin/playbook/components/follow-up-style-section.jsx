"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  Plus,
  Check,
  X,
} from "lucide-react";
import AddPromptRuleModal from "./add-prompt-rule-modal";
import AddCoachingPillarModal from "./add-coaching-pillar-modal";
import { confirmReset } from "@/lib/alerts";
import toast from "react-hot-toast";

export const DEFAULT_FOLLOW_UP_STYLE = {
  goal: "Stay top of mind, create value, and move the conversation forward consistently without being pushy or generic.",
  guidance:
    "Be timely, relevant, and personalized. Add value in every touchpoint and make it easy for the lead to respond.",
  tones: ["Professional", "Warm", "Confident", "Helpful", "Non-Pushy"],
  selectedTones: ["Professional", "Warm", "Confident", "Helpful", "Non-Pushy"],
  encouragedElements: [
    "Value or insight",
    "Reference past conversation",
    "Clear next step",
    "Easy response ask",
    "Reason to reply now",
    "Reminder of benefit",
  ],
  selectedEncouragedElements: [
    "Value or insight",
    "Reference past conversation",
    "Clear next step",
    "Easy response ask",
    "Reason to reply now",
    "Reminder of benefit",
  ],
  avoidList: [
    "Generic check-ins",
    "\"Just following up\"",
    "Overloading with info",
    "Needy or apologetic tone",
    "Asking too soon",
    "No clear purpose",
  ],
  cadence: [
    {
      step: 1,
      title: "First follow-up",
      description: "Within 24 hours of the call",
    },
    {
      step: 2,
      title: "Second follow-up",
      description: "2–3 days later (if no response)",
    },
    {
      step: 3,
      title: "Third follow-up",
      description: "5–7 days later (if no response)",
    },
    {
      step: 4,
      title: "Ongoing",
      description: "Monthly or as needed with new value",
    },
  ],
  exampleAngles: [
    "New market insight",
    "Comparable or case study",
    "Updated opportunity",
    "Answering a potential concern",
    "Reminder of mutual goal",
    "Time-sensitive opportunity",
    "Invite to short call / review",
  ],
};

const FollowUpStyleSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults,
}) => {
  const [toneModalOpen, setToneModalOpen] = useState(false);
  const [encourageModalOpen, setEncourageModalOpen] = useState(false);
  const [avoidModalOpen, setAvoidModalOpen] = useState(false);

  const currentData = {
    ...DEFAULT_FOLLOW_UP_STYLE,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleToggleTone = (t) => {
    const prev = currentData.selectedTones || [];
    const updated = prev.includes(t)
      ? prev.filter((item) => item !== t)
      : [...prev, t];
    handleFieldChange("selectedTones", updated);
  };

  const handleToggleEncouraged = (el) => {
    const prev = currentData.selectedEncouragedElements || [];
    const updated = prev.includes(el)
      ? prev.filter((item) => item !== el)
      : [...prev, el];
    handleFieldChange("selectedEncouragedElements", updated);
  };

  const handleAddTone = (t) => {
    const tones = currentData.tones || [];
    const sel = currentData.selectedTones || [];
    handleFieldChange("tones", [...tones, t]);
    handleFieldChange("selectedTones", [...sel, t]);
  };

  const handleAddEncouraged = (el) => {
    const elements = currentData.encouragedElements || [];
    const sel = currentData.selectedEncouragedElements || [];
    handleFieldChange("encouragedElements", [...elements, el]);
    handleFieldChange("selectedEncouragedElements", [...sel, el]);
  };

  const handleAddAvoid = (text) => {
    handleFieldChange("avoidList", [
      ...(currentData.avoidList || []),
      text,
    ]);
  };

  const handleReset = async () => {
    if (!(await confirmReset("Follow-Up Style"))) return;
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_FOLLOW_UP_STYLE);
    }
    toast.success("Reset Follow-Up Style to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Follow-Up Style
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Define how the AI should guide the agent after the call to drive momentum and results.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Define how the AI should guide the agent after the call to drive momentum and results.
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

      {/* ── 1. What is the goal of follow-up in this playbook? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What is the goal of follow-up in this playbook?
        </label>
        <div className="relative">
          <textarea
            value={currentData.goal}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                handleFieldChange("goal", e.target.value);
              }
            }}
            rows={2}
            maxLength={500}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.goal || "").length}/500
          </div>
        </div>
      </div>

      {/* ── 2. How should the AI guide the agent's follow-up approach? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should the AI guide the agent&apos;s follow-up approach?
        </label>
        <div className="relative">
          <textarea
            value={currentData.guidance}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                handleFieldChange("guidance", e.target.value);
              }
            }}
            rows={2}
            maxLength={500}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.guidance || "").length}/500
          </div>
        </div>
      </div>

      {/* ── 3. What tone should the AI use in follow-up prompts? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What tone should the AI use in follow-up prompts?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.tones || []).map((t) => {
            const isSelected = (currentData.selectedTones || []).includes(t);

            return (
              <button
                key={t}
                type="button"
                onClick={() => handleToggleTone(t)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {t}
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setToneModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 4. What should the AI encourage the agent to include? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should the AI encourage the agent to include?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.encouragedElements || []).map((el) => {
            const isSelected = (
              currentData.selectedEncouragedElements || []
            ).includes(el);

            return (
              <button
                key={el}
                type="button"
                onClick={() => handleToggleEncouraged(el)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {el}
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setEncourageModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 5. What should the AI avoid in follow-up? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should the AI avoid in follow-up?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.avoidList || []).map((item, idx) => (
            <div
              key={idx}
              className="py-1.5 px-3 rounded-xl border border-red-200 bg-red-50/60 text-red-600 text-xs font-medium flex items-center gap-1.5 shadow-2xs"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{item}</span>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setAvoidModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 6. Recommended follow-up cadence (AI guidance) ── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-baseline gap-1.5">
          <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Recommended follow-up cadence
          </label>
          <span className="text-[11px] text-medium-black font-normal">
            (AI guidance)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(currentData.cadence || DEFAULT_FOLLOW_UP_STYLE.cadence).map((c) => (
            <div
              key={c.step}
              className="p-3.5 rounded-xl border border-light-gray bg-white space-y-1.5 shadow-2xs min-w-0 break-words"
            >
              <div className="w-5 h-5 rounded-full bg-light-gray flex items-center justify-center text-[11px] font-bold text-medium-black">
                {c.step}
              </div>
              <h4 className="text-xs font-bold text-dark-black font-secondary">
                {c.title}
              </h4>
              <p className="text-[11px] text-medium-black leading-snug">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. Example follow-up angles the AI may suggest ── */}
      <div className="space-y-2.5 pt-1">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          Example follow-up angles the AI may suggest
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.exampleAngles || []).map((angle, idx) => (
            <div
              key={idx}
              className="py-1.5 px-3 rounded-xl border border-light-gray bg-white text-xs font-medium text-dark-black shadow-2xs flex items-center gap-1.5"
            >
              <span>{angle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddCoachingPillarModal
        isOpen={toneModalOpen}
        onClose={() => setToneModalOpen(false)}
        onAdd={handleAddTone}
      />

      <AddCoachingPillarModal
        isOpen={encourageModalOpen}
        onClose={() => setEncourageModalOpen(false)}
        onAdd={handleAddEncouraged}
      />

      <AddPromptRuleModal
        isOpen={avoidModalOpen}
        onClose={() => setAvoidModalOpen(false)}
        onAdd={handleAddAvoid}
        type="avoid"
      />
    </div>
  );
};

export default FollowUpStyleSection;

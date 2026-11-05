"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  Plus,
  Check,
  X,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import AddPromptRuleModal from "./add-prompt-rule-modal";
import AddCoachingPillarModal from "./add-coaching-pillar-modal";
import toast from "react-hot-toast";

export const DEFAULT_OBJECTION_TONE = {
  intent:
    "Protect trust, reduce defensiveness, and guide the conversation forward — never to argue or win.",
  emotionalResponse:
    "Calm, composed, and empathetic. Validate the concern first, then reframe with confidence and control.",
  avoidWhenResponding: [
    "Getting defensive",
    "Argue or over-explain",
    "Sounding scripted",
    "Pushing too hard",
    "Discounting their concern",
    "Pressure to decide",
  ],
  focusInstead: [
    "Validate",
    "Empathize",
    "Reframe",
    "Clarify",
    "Educate simply",
    "Offer perspective",
    "Guide next step",
    "Restore confidence",
  ],
  selectedFocus: [
    "Validate",
    "Empathize",
    "Reframe",
    "Clarify",
    "Educate simply",
    "Offer perspective",
    "Guide next step",
    "Restore confidence",
  ],
  adaptToEmotionLevel: true,
};

const RESPONSE_STEPS = [
  {
    step: 1,
    title: "Acknowledge",
    description: "Validate their concern.",
  },
  {
    step: 2,
    title: "Reframe",
    description: "Shift the focus or perspective.",
  },
  {
    step: 3,
    title: "Add Value",
    description: "Share insight or separate fact from fear.",
  },
  {
    step: 4,
    title: "Guide Forward",
    description: "Lead to clarity or next step.",
  },
];

const ObjectionToneSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults = () => {},
}) => {
  const [avoidModalOpen, setAvoidModalOpen] = useState(false);
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [intensityOpen, setIntensityOpen] = useState(false);

  const currentData = {
    ...DEFAULT_OBJECTION_TONE,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleToggleFocus = (f) => {
    const prev = currentData.selectedFocus || [];
    const updated = prev.includes(f)
      ? prev.filter((item) => item !== f)
      : [...prev, f];
    handleFieldChange("selectedFocus", updated);
  };

  const handleAddAvoid = (text) => {
    handleFieldChange("avoidWhenResponding", [
      ...(currentData.avoidWhenResponding || []),
      text,
    ]);
  };

  const handleAddFocus = (text) => {
    const focus = currentData.focusInstead || [];
    const sel = currentData.selectedFocus || [];
    handleFieldChange("focusInstead", [...focus, text]);
    handleFieldChange("selectedFocus", [...sel, text]);
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_OBJECTION_TONE);
    }
    toast.success("Reset Objection Tone to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Objection Tone
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Set the tone and mindset the AI should use when responding to any objection.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Set the tone and mindset the AI should use when responding to any objection.
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

      {/* ── 1. What is the intent behind every objection response? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What is the intent behind every objection response?
        </label>
        <div className="relative">
          <textarea
            value={currentData.intent}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("intent", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.intent || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 2. How should the AI respond emotionally? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should the AI respond emotionally?
        </label>
        <div className="relative">
          <textarea
            value={currentData.emotionalResponse}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("emotionalResponse", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.emotionalResponse || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 3. What should the AI avoid when responding to objections? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should the AI avoid when responding to objections?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.avoidWhenResponding || []).map((item, idx) => (
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

      {/* ── 4. What should the AI focus on instead? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should the AI focus on instead?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.focusInstead || []).map((f) => {
            const isSelected = (currentData.selectedFocus || []).includes(f);

            return (
              <button
                key={f}
                type="button"
                onClick={() => handleToggleFocus(f)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
                <span>{f}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setFocusModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 5. Preferred objection response structure ── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-baseline gap-1.5">
          <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Preferred objection response structure
          </label>
          <span className="text-[11px] text-medium-black font-normal">
            (AI will follow this flow)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RESPONSE_STEPS.map((s) => (
            <div
              key={s.step}
              className="p-3.5 rounded-xl border border-light-gray bg-white space-y-1.5 shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-light-gray flex items-center justify-center text-[11px] font-bold text-medium-black">
                {s.step}
              </div>
              <h4 className="text-xs font-bold text-dark-black font-secondary">
                {s.title}
              </h4>
              <p className="text-[11px] text-medium-black leading-snug">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Objection intensity handling ── */}
      <div className="space-y-2 pt-1">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          Objection intensity handling
        </label>

        <div
          onClick={() => setIntensityOpen(!intensityOpen)}
          className="p-4 rounded-xl border border-light-gray bg-white flex items-center justify-between gap-4 cursor-pointer hover:border-medium-black/30 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-primary border border-teal-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
                Adapt to emotion level
              </h4>
              <p className="text-[11px] text-medium-black leading-snug">
                AI adjusts tone and depth based on the lead&apos;s emotional intensity.
              </p>
            </div>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-medium-black shrink-0 transition-transform ${
              intensityOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Modals */}
      <AddPromptRuleModal
        isOpen={avoidModalOpen}
        onClose={() => setAvoidModalOpen(false)}
        onAdd={handleAddAvoid}
        type="avoid"
      />

      <AddCoachingPillarModal
        isOpen={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        onAdd={handleAddFocus}
      />
    </div>
  );
};

export default ObjectionToneSection;

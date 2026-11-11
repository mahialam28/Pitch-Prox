"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  Plus,
  Check,
  ChevronDown,
  Droplets,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import AddPromptRuleModal from "./add-prompt-rule-modal";
import AddPromptToneModal from "./add-prompt-tone-modal";
import { confirmReset } from "@/lib/alerts";
import toast from "react-hot-toast";

export const DEFAULT_PROMPT_VOICE = {
  overallVoice: "Confident, Consultative, and Premium",
  agentSpeakingStyle:
    "Speak like a seasoned advisor sitting beside the agent — clear, direct, encouraging, and focused on strategy and results.",
  tones: [
    { id: "confident", label: "Confident", icon: "check", selected: true },
    { id: "consultative", label: "Consultative", icon: "check", selected: true },
    { id: "calm", label: "Calm", icon: "droplet", selected: true },
    { id: "professional", label: "Professional", icon: "check", selected: true },
    { id: "friendly", label: "Friendly", icon: "chat", selected: false },
  ],
  writingRules: [
    "Short, punchy, and easy to read",
    "Natural, conversational language",
    "Strategic questions over statements",
    "Active and solution-focused",
    "No fluff or generic motivation",
  ],
  avoidRules: [
    "Pushy or salesy language",
    "Overly casual or slang",
    "Long explanations or monologues",
    "Fear-based or negative framing",
    "Generic cheerleading",
  ],
  examples: [
    {
      id: 1,
      quote: "Let's look at the bigger picture here.",
      tag: "Perspective",
    },
    {
      id: 2,
      quote: "What outcome are you really after?",
      tag: "Strategic",
      selected: true,
    },
    {
      id: 3,
      quote: "Good call bringing that up.",
      tag: "Empathetic",
    },
    {
      id: 4,
      quote: "Here's the move that makes sense.",
      tag: "Decisive",
    },
  ],
  customNotes:
    "This voice should always elevate the conversation and keep the agent in control.",
};

const OVERALL_VOICE_OPTIONS = [
  "Confident, Consultative, and Premium",
  "Direct, High-Urgency, and Results-Driven",
  "Empathetic, Supportive, and Value-First",
  "Analytical, Strategic, and Data-Backed",
  "Authoritative, Prescriptive, and Decisive",
  "Balanced / Natural / Conversational",
];

const PromptVoiceSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults,
}) => {
  const [toneModalOpen, setToneModalOpen] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [ruleModalType, setRuleModalType] = useState("guideline"); // "guideline" | "avoid"
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeExampleId, setActiveExampleId] = useState(2);

  const currentData = {
    ...DEFAULT_PROMPT_VOICE,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleToggleTone = (toneId) => {
    const updated = (currentData.tones || DEFAULT_PROMPT_VOICE.tones).map((t) =>
      t.id === toneId ? { ...t, selected: !t.selected } : t
    );
    handleFieldChange("tones", updated);
  };

  const handleAddTone = (label) => {
    const newTone = {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label: label.trim(),
      icon: "check",
      selected: true,
    };
    handleFieldChange("tones", [
      ...(currentData.tones || DEFAULT_PROMPT_VOICE.tones),
      newTone,
    ]);
  };

  const handleAddRule = (ruleText) => {
    if (ruleModalType === "guideline") {
      handleFieldChange("writingRules", [
        ...(currentData.writingRules || DEFAULT_PROMPT_VOICE.writingRules),
        ruleText,
      ]);
    } else {
      handleFieldChange("avoidRules", [
        ...(currentData.avoidRules || DEFAULT_PROMPT_VOICE.avoidRules),
        ruleText,
      ]);
    }
  };

  const handleReset = async () => {
    if (!(await confirmReset("Prompt Voice"))) return;
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_PROMPT_VOICE);
    }
    setActiveExampleId(2);
    toast.success("Reset Prompt Voice to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Prompt Voice
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Define the voice, tone, and communication style the AI should use in every prompt.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Define the voice, tone, and communication style the AI should use in every prompt.
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

      {/* ── 1. What is the overall voice of this playbook? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What is the overall voice of this playbook?
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black flex items-center justify-between font-medium cursor-pointer hover:border-medium-black/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs text-left"
          >
            <span>{currentData.overallVoice}</span>
            <ChevronDown className="w-4 h-4 text-medium-black shrink-0" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-light-gray shadow-lg z-20 overflow-hidden py-1">
                {OVERALL_VOICE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      handleFieldChange("overallVoice", opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-xs text-left transition-colors flex items-center justify-between ${
                      currentData.overallVoice === opt
                        ? "bg-teal-50/70 text-primary font-semibold"
                        : "text-dark-black hover:bg-light-gray/40 font-normal"
                    }`}
                  >
                    <span>{opt}</span>
                    {currentData.overallVoice === opt && (
                      <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 2. How should the AI speak to the agent? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should the AI speak to the agent?
        </label>
        <div className="relative">
          <textarea
            value={currentData.agentSpeakingStyle}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("agentSpeakingStyle", e.target.value);
              }
            }}
            rows={3}
            maxLength={300}
            placeholder="Describe how the AI should speak to the agent..."
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.agentSpeakingStyle || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 3. What should the tone feel like? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should the tone feel like?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.tones || DEFAULT_PROMPT_VOICE.tones).map((tone) => {
            const isSelected = tone.selected;

            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => handleToggleTone(tone.id)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {tone.id === "calm" ? (
                  <Droplets className="w-3.5 h-3.5 shrink-0" />
                ) : tone.id === "friendly" ? (
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                ) : null}

                <span>{tone.label}</span>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0 ml-0.5" />
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

      {/* ── 4 & 5. How should prompts be written? & What to avoid in voice? (2 Columns) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Left Column: How should prompts be written? */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
              How should prompts be written?
            </h3>
            <div className="space-y-2">
              {(currentData.writingRules || DEFAULT_PROMPT_VOICE.writingRules).map(
                (rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-dark-black font-normal leading-snug"
                  >
                    <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRuleModalType("guideline");
              setRuleModalOpen(true);
            }}
            className="w-full py-2 px-3 rounded-xl border border-light-gray hover:border-primary/40 hover:bg-teal-50/50 bg-white text-xs font-semibold text-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </button>
        </div>

        {/* Right Column: What to avoid in voice? */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
              What to avoid in voice?
            </h3>
            <div className="space-y-2">
              {(currentData.avoidRules || DEFAULT_PROMPT_VOICE.avoidRules).map(
                (rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-dark-black font-normal leading-snug"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRuleModalType("avoid");
              setRuleModalOpen(true);
            }}
            className="w-full py-2 px-3 rounded-xl border border-light-gray hover:border-primary/40 hover:bg-teal-50/50 bg-white text-xs font-semibold text-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </button>
        </div>
      </div>

      {/* ── 6. Voice Examples ── */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Voice Examples
          </h3>
          <span className="text-[11px] text-medium-black font-normal">
            (Guiding examples for style, not exact prompts)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(currentData.examples || DEFAULT_PROMPT_VOICE.examples).map((ex) => {
            const isSelected = activeExampleId === ex.id;

            return (
              <div
                key={ex.id}
                onClick={() => setActiveExampleId(ex.id)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all cursor-pointer select-none ${
                  isSelected
                    ? "border-primary/60 bg-teal-50/50 shadow-2xs ring-1 ring-primary/20"
                    : "border-light-gray bg-white hover:border-medium-black/20"
                }`}
              >
                <p className="text-xs text-dark-black font-medium leading-relaxed">
                  &ldquo;{ex.quote}&rdquo;
                </p>
                <div>
                  <span className="text-[11px] font-semibold text-primary font-secondary">
                    {ex.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7. Custom Notes (Optional) ── */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-baseline gap-1.5">
          <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Custom Notes
          </label>
          <span className="text-[11px] text-medium-black font-normal">
            (Optional)
          </span>
        </div>

        <div className="relative">
          <textarea
            value={currentData.customNotes}
            onChange={(e) => {
              if (e.target.value.length <= 200) {
                handleFieldChange("customNotes", e.target.value);
              }
            }}
            rows={2}
            maxLength={200}
            placeholder="Add any internal custom notes or guidelines..."
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.customNotes || "").length}/200
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddPromptToneModal
        isOpen={toneModalOpen}
        onClose={() => setToneModalOpen(false)}
        onAdd={handleAddTone}
      />

      <AddPromptRuleModal
        isOpen={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        onAdd={handleAddRule}
        type={ruleModalType}
      />
    </div>
  );
};

export default PromptVoiceSection;

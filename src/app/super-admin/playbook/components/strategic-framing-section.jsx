"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  Plus,
  Check,
  MinusCircle,
  Sparkles,
  Users,
  Droplets,
  Shield,
  MessageCircle,
  AlignLeft,
  MessageSquareQuote,
  ShieldCheck,
  BookOpen,
  BarChart2,
  Scale,
  Clock,
  TrendingDown,
  Compass,
} from "lucide-react";
import AddStrategicWordModal from "./add-strategic-word-modal";
import AddStrategicPrincipleModal from "./add-strategic-principle-modal";
import { confirmReset } from "@/lib/alerts";
import toast from "react-hot-toast";

export const DEFAULT_STRATEGIC_FRAMING = {
  emphasis:
    "Position every conversation around strategy, value, and net outcome — not pressure or persuasion.",
  guidance:
    "Guide the agent to ask sharper questions, reframe concerns calmly, and move the conversation forward without sounding needy.",
  feelings: [
    { id: "confident", label: "Confident", icon: "sparkles", selected: true },
    { id: "consultative", label: "Consultative", icon: "users", selected: true },
    { id: "calm", label: "Calm", icon: "droplets", selected: true },
    { id: "premium", label: "Premium", icon: "shield", selected: true },
    { id: "friendly", label: "Friendly", icon: "chat", selected: false },
  ],
  wordingStyles: [
    { id: "short-statements", label: "Short statements", icon: "menu", selected: true },
    { id: "strategic-questions", label: "Strategic questions", icon: "question", selected: true },
    { id: "calm-authority", label: "Calm authority", icon: "shield", selected: true },
    { id: "story-based", label: "Story-based", icon: "book", selected: false },
    { id: "data-driven", label: "Data-driven", icon: "chart", selected: false },
    { id: "conversational", label: "Conversational", icon: "chat", selected: false },
  ],
  encourageWords: [
    "strategy",
    "net outcome",
    "maximize",
    "position",
    "unlock value",
    "long-term",
  ],
  avoidWords: [
    "I just want to help",
    "trust me",
    "best price guaranteed",
    "you have to",
    "desperate",
    "pushy",
  ],
  principles: [
    { id: "value-first", label: "Value First", icon: "shield", selected: true },
    { id: "future-pacing", label: "Future Pacing", icon: "compass", selected: true },
    { id: "contrast", label: "Contrast", icon: "scale", selected: true },
    { id: "scarcity", label: "Scarcity (Ethical)", icon: "clock", selected: true },
    { id: "loss-aversion", label: "Loss Aversion", icon: "trend", selected: true },
    { id: "authority", label: "Authority", icon: "none", selected: false },
    { id: "curiosity", label: "Curiosity", icon: "none", selected: true },
    { id: "reciprocity", label: "Reciprocity", icon: "none", selected: true },
  ],
};

const StrategicFramingSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults,
}) => {
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [wordModalType, setWordModalType] = useState("encourage"); // "encourage" | "avoid"
  const [principleModalOpen, setPrincipleModalOpen] = useState(false);
  const [principleCategory, setPrincipleCategory] = useState("principle"); // "principle" | "wording" | "feeling"

  const currentData = {
    ...DEFAULT_STRATEGIC_FRAMING,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleToggleFeeling = (id) => {
    const updated = (currentData.feelings || DEFAULT_STRATEGIC_FRAMING.feelings).map(
      (f) => (f.id === id ? { ...f, selected: !f.selected } : f)
    );
    handleFieldChange("feelings", updated);
  };

  const handleToggleWording = (id) => {
    const updated = (
      currentData.wordingStyles || DEFAULT_STRATEGIC_FRAMING.wordingStyles
    ).map((w) => (w.id === id ? { ...w, selected: !w.selected } : w));
    handleFieldChange("wordingStyles", updated);
  };

  const handleTogglePrinciple = (id) => {
    const updated = (
      currentData.principles || DEFAULT_STRATEGIC_FRAMING.principles
    ).map((p) => (p.id === id ? { ...p, selected: !p.selected } : p));
    handleFieldChange("principles", updated);
  };

  const handleAddWord = (word) => {
    if (wordModalType === "encourage") {
      handleFieldChange("encourageWords", [
        ...(currentData.encourageWords || DEFAULT_STRATEGIC_FRAMING.encourageWords),
        word,
      ]);
    } else {
      handleFieldChange("avoidWords", [
        ...(currentData.avoidWords || DEFAULT_STRATEGIC_FRAMING.avoidWords),
        word,
      ]);
    }
  };

  const handleAddPrinciple = (label) => {
    if (principleCategory === "feeling") {
      const newFeeling = {
        id: label.toLowerCase().replace(/\s+/g, "-"),
        label,
        icon: "sparkles",
        selected: true,
      };
      handleFieldChange("feelings", [
        ...(currentData.feelings || DEFAULT_STRATEGIC_FRAMING.feelings),
        newFeeling,
      ]);
    } else if (principleCategory === "wording") {
      const newWording = {
        id: label.toLowerCase().replace(/\s+/g, "-"),
        label,
        icon: "menu",
        selected: true,
      };
      handleFieldChange("wordingStyles", [
        ...(currentData.wordingStyles || DEFAULT_STRATEGIC_FRAMING.wordingStyles),
        newWording,
      ]);
    } else {
      const newPrinciple = {
        id: label.toLowerCase().replace(/\s+/g, "-"),
        label,
        icon: "none",
        selected: true,
      };
      handleFieldChange("principles", [
        ...(currentData.principles || DEFAULT_STRATEGIC_FRAMING.principles),
        newPrinciple,
      ]);
    }
  };

  const handleReset = async () => {
    if (!(await confirmReset("Strategic Framing"))) return;
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_STRATEGIC_FRAMING);
    }
    toast.success("Reset Strategic Framing to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Strategic Framing
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Define how the AI should frame conversations, strategic principles, and vocabulary choices.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Define how the AI should frame every conversation.
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

      {/* ── 1. What should this playbook emphasize? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should this playbook emphasize?
        </label>
        <div className="relative">
          <textarea
            value={currentData.emphasis}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                handleFieldChange("emphasis", e.target.value);
              }
            }}
            rows={2}
            maxLength={500}
            placeholder="Define the primary strategic emphasis of every interaction..."
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.emphasis || "").length}/500
          </div>
        </div>
      </div>

      {/* ── 2. How should AI guide the agent? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should AI guide the agent?
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
            placeholder="Describe how the AI provides guidance and cues to the agent..."
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.guidance || "").length}/500
          </div>
        </div>
      </div>

      {/* ── 3. What should prompts feel like? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should prompts feel like?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.feelings || DEFAULT_STRATEGIC_FRAMING.feelings).map((item) => {
            const isSelected = item.selected;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleFeeling(item.id)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {item.id === "confident" ? (
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                ) : item.id === "consultative" ? (
                  <Users className="w-3.5 h-3.5 shrink-0" />
                ) : item.id === "calm" ? (
                  <Droplets className="w-3.5 h-3.5 shrink-0" />
                ) : item.id === "premium" ? (
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                ) : item.id === "friendly" ? (
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                ) : null}

                <span>{item.label}</span>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0 ml-0.5" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setPrincipleCategory("feeling");
              setPrincipleModalOpen(true);
            }}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 4. Preferred wording style (Select all that apply) ── */}
      <div className="space-y-2.5">
        <div className="flex items-baseline gap-1.5">
          <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Preferred wording style
          </label>
          <span className="text-[11px] text-medium-black font-normal">
            (Select all that apply)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.wordingStyles || DEFAULT_STRATEGIC_FRAMING.wordingStyles).map(
            (item) => {
              const isSelected = item.selected;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleWording(item.id)}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                    isSelected
                      ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                      : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                  }`}
                >
                  {item.id === "short-statements" ? (
                    <AlignLeft className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "strategic-questions" ? (
                    <MessageSquareQuote className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "calm-authority" ? (
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "story-based" ? (
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "data-driven" ? (
                    <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "conversational" ? (
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : null}

                  <span>{item.label}</span>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0 ml-0.5" />
                  )}
                </button>
              );
            }
          )}

          <button
            type="button"
            onClick={() => {
              setPrincipleCategory("wording");
              setPrincipleModalOpen(true);
            }}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 5 & 6. Words/phrases to encourage & Words/phrases to avoid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Left Column: Words / phrases to encourage */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Words / phrases to encourage
          </h3>

          <div className="space-y-2">
            {(currentData.encourageWords || DEFAULT_STRATEGIC_FRAMING.encourageWords).map(
              (word, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-dark-black font-normal"
                >
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                  <span>{word}</span>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setWordModalType("encourage");
              setWordModalOpen(true);
            }}
            className="text-xs font-semibold text-primary hover:text-medium-teal flex items-center gap-1 cursor-pointer pt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>

        {/* Right Column: Words / phrases to avoid */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Words / phrases to avoid
          </h3>

          <div className="space-y-2">
            {(currentData.avoidWords || DEFAULT_STRATEGIC_FRAMING.avoidWords).map(
              (word, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-dark-black font-normal"
                >
                  <MinusCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{word}</span>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setWordModalType("avoid");
              setWordModalOpen(true);
            }}
            className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer pt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 7. Strategic principles to apply ── */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-baseline gap-1.5">
          <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Strategic principles to apply
          </label>
          <span className="text-[11px] text-medium-black font-normal">
            (Select all that apply)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.principles || DEFAULT_STRATEGIC_FRAMING.principles).map(
            (item) => {
              const isSelected = item.selected;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTogglePrinciple(item.id)}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                    isSelected
                      ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                      : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                  }`}
                >
                  {item.id === "value-first" ? (
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "future-pacing" ? (
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "contrast" ? (
                    <Scale className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "scarcity" ? (
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                  ) : item.id === "loss-aversion" ? (
                    <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                  ) : null}

                  <span>{item.label}</span>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0 ml-0.5" />
                  )}
                </button>
              );
            }
          )}

          <button
            type="button"
            onClick={() => {
              setPrincipleCategory("principle");
              setPrincipleModalOpen(true);
            }}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddStrategicWordModal
        isOpen={wordModalOpen}
        onClose={() => setWordModalOpen(false)}
        onAdd={handleAddWord}
        type={wordModalType}
      />

      <AddStrategicPrincipleModal
        isOpen={principleModalOpen}
        onClose={() => setPrincipleModalOpen(false)}
        onAdd={handleAddPrinciple}
        category={principleCategory}
      />
    </div>
  );
};

export default StrategicFramingSection;

"use client";

import React from "react";
import {
  Target,
  Heart,
  Shield,
  AlertTriangle,
  Flag,
  Bell,
  Clock,
  Layers,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export const LOGIC_CATEGORIES = [
  {
    id: "intent-detection",
    label: "Intent Detection",
    icon: Target,
  },
  {
    id: "emotion-analysis",
    label: "Emotion Analysis",
    icon: Heart,
  },
  {
    id: "trust-logic",
    label: "Trust Logic",
    icon: Shield,
  },
  {
    id: "objection-logic",
    label: "Objection Logic",
    icon: AlertTriangle,
  },
  {
    id: "response-selection",
    label: "Response Selection",
    icon: Flag,
  },
  {
    id: "escalation-logic",
    label: "Escalation Logic",
    icon: Bell,
  },
  {
    id: "timing-pacing",
    label: "Timing & Pacing",
    icon: Clock,
  },
  {
    id: "follow-up-logic",
    label: "Follow-Up Logic",
    icon: Layers,
  },
  {
    id: "success-indicators",
    label: "Success Indicators",
    icon: CheckCircle2,
  },
];

const LogicCategoriesCard = ({
  selectedCategory = null,
  onSelectCategory = () => { },
  onResetDefaults = () => { },
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-dark-black font-secondary">
          Logic Categories
        </h2>
        <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
          Define the decision logic that drives how the AI thinks in real time.
        </p>
      </div>

      {/* Category List */}
      <div className="space-y-1.5">
        {LOGIC_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full group px-3.5 py-3 rounded-xl border flex items-center justify-between transition-all duration-150 cursor-pointer text-left select-none ${isActive
                  ? "bg-teal-50/70 border-primary/40 text-primary shadow-2xs font-semibold"
                  : "bg-white hover:bg-light-gray/40 border-transparent hover:border-light-gray text-medium-black hover:text-dark-black"
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${isActive
                      ? "text-primary stroke-[2.2]"
                      : "text-medium-black group-hover:text-dark-black"
                    }`}
                />
                <span
                  className={`text-xs sm:text-[13px] leading-snug min-w-0 break-words font-secondary ${isActive
                      ? "font-semibold text-primary"
                      : "font-medium text-medium-black group-hover:text-dark-black"
                    }`}
                >
                  {cat.label}
                </span>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${isActive
                    ? "text-primary translate-x-0.5"
                    : "text-light-black group-hover:text-medium-black group-hover:translate-x-0.5"
                  }`}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom Reset Button */}
      <div className="pt-2 border-t border-light-gray">
        <button
          type="button"
          onClick={onResetDefaults}
          className="w-full py-2.5 px-4 rounded-xl border border-primary/40 hover:bg-teal-50/60 bg-white text-primary font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Logic Defaults</span>
        </button>
      </div>
    </div>
  );
};

export default LogicCategoriesCard;

"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  Lock,
  AlertTriangle,
  Target,
  RotateCcw,
  Check,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

export const DEFAULT_GUARDRAILS = [
  {
    id: "be-professional",
    title: "Be Professional",
    description: "Keep prompts respectful, ethical, and compliant.",
    icon: ShieldCheck,
    iconBg: "bg-teal-50 text-teal-600 border border-teal-100/60",
    enabled: true,
  },
  {
    id: "no-financial-advice",
    title: "No Legal, Tax, or Financial Advice",
    description: "Never give legal, tax, or financial guidance.",
    icon: User,
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100/60",
    enabled: true,
  },
  {
    id: "protect-privacy",
    title: "Protect Privacy",
    description: "Never ask for or expose sensitive personal information.",
    icon: Lock,
    iconBg: "bg-teal-50 text-teal-600 border border-teal-100/60",
    enabled: true,
  },
  {
    id: "avoid-harmful-content",
    title: "Avoid Harmful or Offensive Content",
    description: "No hate, discrimination, threats, or inappropriate language.",
    icon: AlertTriangle,
    iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100/60",
    enabled: true,
  },
  {
    id: "stay-on-topic",
    title: "Stay On Topic",
    description: "Keep prompts focused on the call purpose and next step.",
    icon: Target,
    iconBg: "bg-teal-50 text-teal-600 border border-teal-100/60",
    enabled: true,
  },
];

export default function AiSafetyGuardrailsSection({
  formData = {},
  onChange = () => {},
  onBack = () => {},
}) {
  const [guardrails, setGuardrails] = useState(
    formData.guardrails || DEFAULT_GUARDRAILS
  );

  const handleToggle = (id) => {
    const updated = guardrails.map((g) =>
      g.id === id ? { ...g, enabled: !g.enabled } : g
    );
    setGuardrails(updated);
    onChange("guardrails", updated);
    const target = updated.find((g) => g.id === id);
    toast.success(`${target.title} is now ${target.enabled ? "Enabled" : "Disabled"}`);
  };

  const handleResetToDefault = () => {
    setGuardrails(DEFAULT_GUARDRAILS);
    onChange("guardrails", DEFAULT_GUARDRAILS);
    toast.success("Safety guardrails reset to default!");
  };

  return (
    <div className="space-y-5">
      {/* ── Top Header Bar ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-dark-black font-secondary">
            Safety & Guardrails
          </h2>
          <p className="text-xs text-medium-black mt-0.5 font-normal">
            Set the boundaries that keep AI prompts safe, professional, and effective.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* ── 5 Guardrail Rule Cards ── */}
      <div className="space-y-3">
        {guardrails.map((rule) => {
          const IconComponent = rule.icon || ShieldCheck;
          return (
            <div
              key={rule.id}
              onClick={() => handleToggle(rule.id)}
              className="p-4 sm:p-4.5 rounded-2xl border border-light-gray bg-white hover:border-primary/40 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group select-none"
            >
              {/* Left Info with Circle Icon */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${rule.iconBg}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary leading-tight">
                    {rule.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-light-black truncate mt-0.5 font-normal">
                    {rule.description}
                  </p>
                </div>
              </div>

              {/* Right Status Badge & Arrow */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    rule.enabled
                      ? "text-primary"
                      : "text-light-black"
                  }`}
                >
                  {rule.enabled ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Enabled</span>
                    </>
                  ) : (
                    <span>Disabled</span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-light-black/70 group-hover:text-dark-black group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Back to Prompt Length Button ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back: Prompt Length</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  CheckCircle2,
  MinusCircle,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { confirmReset } from "@/lib/alerts";
import toast from "react-hot-toast";

export const DEFAULT_DO_DONT_BOUNDARIES = {
  doList: [
    "Add value first – provide insight, education, or perspective.",
    "Build trust – show empathy, listen, and validate the situation.",
    "Be clear and confident – speak with certainty, not arrogance.",
    "Ask questions – uncover needs, motivations, and constraints.",
    "Personalize – reference their situation and what matters to them.",
    "Guide next steps – move the conversation forward with value.",
    "Reinforce benefits – highlight outcomes and positive impact.",
    "Stay professional – respectful, polished, and solution-focused.",
    "Use positive language – solution-oriented and forward-looking.",
    "Keep it concise – easy to understand and actionable.",
  ],
  dontList: [
    "Make guarantees or promises about results.",
    "Discuss specific pricing, commissions, or fees.",
    "Provide legal, tax, or financial advice.",
    "Disparage competitors, agents, or brokerages.",
    "Use aggressive, manipulative, or high-pressure tactics.",
    "Argue, debate, or get emotional.",
    "Use filler words or weak language (um, like, you know).",
    "Make unethical or misleading statements.",
    "Ask for sensitive personal or private information unnecessarily.",
    "Go off-topic or derail the conversation.",
  ],
};

const DoDontBoundariesSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults,
}) => {
  const currentData = {
    ...DEFAULT_DO_DONT_BOUNDARIES,
    ...data,
  };

  const handleReset = async () => {
    if (!(await confirmReset("Do / Don't Boundaries"))) return;
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_DO_DONT_BOUNDARIES);
    }
    toast.success("Reset Do / Don't Boundaries to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Do / Don&apos;t Boundaries
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Set the clear boundaries for what the AI can and cannot say or do.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Set the clear boundaries for what the AI can and cannot say or do.
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

      {/* ── 2 Main Columns: DO vs DON'T ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* DO Column */}
        <div className="rounded-2xl border border-teal-200/70 bg-teal-50/20 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-100/70 border border-teal-200 px-3 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>DO – Always Allowed &amp; Encouraged</span>
          </div>

          <div className="space-y-3">
            {(currentData.doList || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-dark-black font-normal leading-snug"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DON'T Column */}
        <div className="rounded-2xl border border-red-200/70 bg-red-50/20 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-100/70 border border-red-200 px-3 py-2 rounded-xl">
            <MinusCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>DON&apos;T – Never Allowed</span>
          </div>

          <div className="space-y-3">
            {(currentData.dontList || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-dark-black font-normal leading-snug"
              >
                <MinusCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom 2 Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Boundary Principle */}
        <div className="rounded-2xl border border-teal-200/80 bg-teal-50/60 p-4 sm:p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
              Boundary Principle
            </h3>
          </div>
          <p className="text-xs text-medium-black leading-relaxed font-normal">
            PitchProx will never break these boundaries. It will only generate prompts that align with what&apos;s allowed and avoid what&apos;s restricted.
          </p>
        </div>

        {/* Boundary Enforcement */}
        <div className="rounded-2xl border border-red-200/70 bg-red-50/50 p-4 sm:p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-500 shrink-0" />
            <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
              Boundary Enforcement
            </h3>
          </div>
          <p className="text-xs text-medium-black leading-relaxed font-normal">
            If the conversation drifts toward a &ldquo;don&apos;t&rdquo; area, PitchProx will redirect with a safe, value-driven prompt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoDontBoundariesSection;

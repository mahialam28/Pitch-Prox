"use client";

import React, { useState } from "react";
import {
  Type,
  ArrowUp,
  ArrowDown,
  Sliders,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { confirmReset } from "@/lib/alerts";
import toast from "react-hot-toast";

const IDEAL_OPTIONS = [
  { value: "15 words", label: "15 words" },
  { value: "20 words", label: "20 words" },
  { value: "25 words", label: "25 words" },
  { value: "30 words", label: "30 words" },
];

const MIN_OPTIONS = [
  { value: "5 words", label: "5 words" },
  { value: "10 words", label: "10 words" },
  { value: "15 words", label: "15 words" },
];

const MAX_OPTIONS = [
  { value: "20 words", label: "20 words" },
  { value: "25 words", label: "25 words" },
  { value: "30 words", label: "30 words" },
  { value: "35 words", label: "35 words" },
  { value: "40 words", label: "40 words" },
  { value: "50 words", label: "50 words" },
];

export default function AiPromptLengthSection({
  formData = {},
  onChange = () => {},
  onBack = () => {},
}) {
  const [idealLength, setIdealLength] = useState(
    formData.idealLength || "20 words"
  );
  const [minLength, setMinLength] = useState(
    formData.minLength || "10 words"
  );
  const [maxLength, setMaxLength] = useState(
    formData.maxLength || "25 words"
  );
  const [autoAdjust, setAutoAdjust] = useState(
    formData.autoAdjust !== undefined ? formData.autoAdjust : true
  );

  const handleSelectIdeal = (val) => {
    setIdealLength(val);
    onChange("idealLength", val);
  };

  const handleSelectMin = (val) => {
    setMinLength(val);
    onChange("minLength", val);
  };

  const handleSelectMax = (val) => {
    setMaxLength(val);
    onChange("maxLength", val);
  };

  const handleToggleAutoAdjust = () => {
    const nextVal = !autoAdjust;
    setAutoAdjust(nextVal);
    onChange("autoAdjust", nextVal);
    toast.success(`Auto adjust ${nextVal ? "enabled" : "disabled"}`);
  };

  const handleResetToDefault = async () => {
    if (!(await confirmReset("Prompt Length"))) return;
    setIdealLength("20 words");
    setMinLength("10 words");
    setMaxLength("25 words");
    setAutoAdjust(true);
    onChange("idealLength", "20 words");
    onChange("minLength", "10 words");
    onChange("maxLength", "25 words");
    onChange("autoAdjust", true);
    toast.success("Prompt length settings reset to default!");
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-dark-black font-secondary">
            Prompt Length Settings
          </h2>
          <p className="text-xs text-medium-black mt-0.5 font-normal">
            Control how long the AI prompts should be during live calls.
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

      {/* ── 4 Length Rows / Cards ── */}
      <div className="space-y-3">
        {/* 1. Ideal Prompt Length */}
        <div className="p-4 sm:p-4.5 rounded-2xl border border-light-gray bg-white shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-light-gray/70 text-medium-black flex items-center justify-center shrink-0">
              <Type className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary leading-tight">
                Ideal Prompt Length
              </h3>
              <p className="text-[11px] sm:text-xs text-light-black truncate mt-0.5 font-normal">
                The recommended length for most prompts.
              </p>
            </div>
          </div>

          <div className="w-32 sm:w-36 shrink-0">
            <Dropdown
              label="20 words"
              items={IDEAL_OPTIONS}
              selected={idealLength}
              onSelect={handleSelectIdeal}
              buttonClassName="py-1.5 px-3 text-xs justify-between"
              className="w-full"
            />
          </div>
        </div>

        {/* 2. Minimum Length */}
        <div className="p-4 sm:p-4.5 rounded-2xl border border-light-gray bg-white shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-light-gray/70 text-medium-black flex items-center justify-center shrink-0">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary leading-tight">
                Minimum Length
              </h3>
              <p className="text-[11px] sm:text-xs text-light-black truncate mt-0.5 font-normal">
                Keeps prompts clear and actionable.
              </p>
            </div>
          </div>

          <div className="w-32 sm:w-36 shrink-0">
            <Dropdown
              label="10 words"
              items={MIN_OPTIONS}
              selected={minLength}
              onSelect={handleSelectMin}
              buttonClassName="py-1.5 px-3 text-xs justify-between"
              className="w-full"
            />
          </div>
        </div>

        {/* 3. Maximum Length */}
        <div className="p-4 sm:p-4.5 rounded-2xl border border-light-gray bg-white shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-light-gray/70 text-medium-black flex items-center justify-center shrink-0">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary leading-tight">
                Maximum Length
              </h3>
              <p className="text-[11px] sm:text-xs text-light-black truncate mt-0.5 font-normal">
                Ensures prompts are easy to read in real time.
              </p>
            </div>
          </div>

          <div className="w-32 sm:w-36 shrink-0">
            <Dropdown
              label="25 words"
              items={MAX_OPTIONS}
              selected={maxLength}
              onSelect={handleSelectMax}
              buttonClassName="py-1.5 px-3 text-xs justify-between"
              className="w-full"
            />
          </div>
        </div>

        {/* 4. Auto Adjust */}
        <div className="p-4 sm:p-4.5 rounded-2xl border border-light-gray bg-white shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-light-gray/70 text-medium-black flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary leading-tight">
                Auto Adjust
              </h3>
              <p className="text-[11px] sm:text-xs text-light-black truncate mt-0.5 font-normal">
                AI will adjust within this range based on context
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={autoAdjust}
            onClick={handleToggleAutoAdjust}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out shadow-2xs ${
              autoAdjust ? "bg-primary" : "bg-light-gray"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                autoAdjust ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Back to Logic & Rules Button ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back: Logic & Rules</span>
        </button>
      </div>
    </div>
  );
}

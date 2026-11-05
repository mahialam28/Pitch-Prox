"use client";

import React, { useState } from "react";
import Dropdown from "@/components/shared/dropdown/dropdown";

const ADAPTATION_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Moderate", label: "Moderate" },
  { value: "Low", label: "Low" },
  { value: "Off", label: "Off" },
];

const MEMORY_OPTIONS = [
  { value: "Last 1 Turn", label: "Last 1 Turn" },
  { value: "Last 2 Turns", label: "Last 2 Turns" },
  { value: "Last 4 Turns", label: "Last 4 Turns" },
  { value: "Full Call", label: "Full Call" },
];

const CREATIVITY_OPTIONS = [
  { value: "Strict", label: "Strict" },
  { value: "Balanced", label: "Balanced" },
  { value: "Creative", label: "Creative" },
];

const FALLBACK_OPTIONS = [
  { value: "Use Default Playbook", label: "Use Default Playbook" },
  { value: "Generic Script", label: "Generic Script" },
  { value: "Silence", label: "Silence" },
];

export default function FrameworkSettingsCard({
  settings = {},
  onChange = () => {},
}) {
  const [adaptation, setAdaptation] = useState(
    settings.dynamicAdaptation || "High"
  );
  const [memory, setMemory] = useState(settings.memoryWindow || "Last 2 Turns");
  const [creativity, setCreativity] = useState(
    settings.creativityLevel || "Balanced"
  );
  const [fallback, setFallback] = useState(
    settings.fallbackBehavior || "Use Default Playbook"
  );

  const handleSelectAdaptation = (val) => {
    setAdaptation(val);
    onChange({ dynamicAdaptation: val });
  };

  const handleSelectMemory = (val) => {
    setMemory(val);
    onChange({ memoryWindow: val });
  };

  const handleSelectCreativity = (val) => {
    setCreativity(val);
    onChange({ creativityLevel: val });
  };

  const handleSelectFallback = (val) => {
    setFallback(val);
    onChange({ fallbackBehavior: val });
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* ── Header ── */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-dark-black font-secondary">
          Framework Settings
        </h3>
      </div>

      {/* ── Settings Rows ── */}
      <div className="space-y-3.5">
        {/* Dynamic Adaptation */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-medium-black font-medium">
            Dynamic Adaptation
          </span>
          <div className="w-44">
            <Dropdown
              label="High"
              items={ADAPTATION_OPTIONS}
              selected={adaptation}
              onSelect={handleSelectAdaptation}
              buttonClassName="py-1.5 px-3 text-xs"
              className="w-full"
            />
          </div>
        </div>

        {/* Memory Window */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-medium-black font-medium">
            Memory Window
          </span>
          <div className="w-44">
            <Dropdown
              label="Last 2 Turns"
              items={MEMORY_OPTIONS}
              selected={memory}
              onSelect={handleSelectMemory}
              buttonClassName="py-1.5 px-3 text-xs"
              className="w-full"
            />
          </div>
        </div>

        {/* Creativity Level */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-medium-black font-medium">
            Creativity Level
          </span>
          <div className="w-44">
            <Dropdown
              label="Balanced"
              items={CREATIVITY_OPTIONS}
              selected={creativity}
              onSelect={handleSelectCreativity}
              buttonClassName="py-1.5 px-3 text-xs"
              className="w-full"
            />
          </div>
        </div>

        {/* Fallback Behavior */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-medium-black font-medium">
            Fallback Behavior
          </span>
          <div className="w-44">
            <Dropdown
              label="Use Default Playbook"
              items={FALLBACK_OPTIONS}
              selected={fallback}
              onSelect={handleSelectFallback}
              placement="top"
              buttonClassName="py-1.5 px-3 text-xs"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Info, Target, Zap, ShieldCheck, Sliders, Repeat } from "lucide-react";
import Tooltip from "@/components/modals/tooltip";

const metrics = [
  {
    id: 1,
    title: "Optimal Adherence Range",
    value: "80% - 89%",
    valueColor: "text-emerald-600",
    icon: Target,
  },
  {
    id: 2,
    title: "Conversion Lift Within Range",
    value: "+32%",
    valueColor: "text-emerald-600",
    icon: Zap,
  },
  {
    id: 3,
    title: "AI Guidance Effectiveness",
    value: "87%",
    valueColor: "text-emerald-600",
    icon: ShieldCheck,
  },
  {
    id: 4,
    title: "Strategic Prompt Modification Score",
    value: "82%",
    valueColor: "text-emerald-600",
    icon: Sliders,
  },
  {
    id: 5,
    title: "Objection Recovery Success Rate",
    value: "68%",
    valueColor: "text-orange-500",
    icon: Repeat,
  },
];

export const AIGuidance = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 leading-tight">
            AI Guidance<br />Effectiveness
          </h2>
          <Tooltip
            title="AI Guidance Effectiveness"
            text="Measures how effectively PitchProX's live guidance contributed to conversation performance based on prompt usage, conversation progression, and resulting outcomes. This metric helps you understand the impact of real-time AI assistance."
            className="self-start mt-1"
          >
            <Info
              tabIndex={0}
              aria-label="More about AI Guidance Effectiveness"
              className="w-4 h-4 text-medium-black/70 shrink-0 transition-colors duration-200 hover:text-primary outline-none"
            />
          </Tooltip>
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 text-light-black shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-medium-black truncate">
                  {item.title}
                </span>
              </div>
              <span className={`text-xs sm:text-sm font-bold shrink-0 ${item.valueColor}`}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIGuidance;
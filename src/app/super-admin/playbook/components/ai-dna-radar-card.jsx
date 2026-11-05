"use client";

import React from "react";
import { Award, CheckCircle2, ShieldCheck, Flame } from "lucide-react";

const AiDnaRadarCard = ({
  directness = 85,
  empathy = 70,
  urgency = 90,
  authority = 95,
}) => {
  const metrics = [
    { label: "Commercial Authority", value: authority, color: "bg-primary" },
    { label: "Urgency & Energy", value: urgency, color: "bg-amber-500" },
    { label: "Directness & Candor", value: directness, color: "bg-blue-500" },
    { label: "Empathy & Active Listening", value: empathy, color: "bg-emerald-500" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
          <Award className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
            Persona Alignment Index
          </h3>
          <p className="text-[11px] text-light-black font-normal">
            Strategic identity profile match
          </p>
        </div>
      </div>

      {/* Alignment Badge */}
      <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-dark-black/90">
            Methodology Alignment
          </span>
        </div>
        <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-white border border-teal-200">
          98% Match
        </span>
      </div>

      {/* Metrics Sliders Display */}
      <div className="space-y-3 pt-1">
        {metrics.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-dark-black/80 text-[11px]">
                {item.label}
              </span>
              <span className="font-bold text-dark-black/90 text-[11px]">
                {item.value}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-light-gray overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-300`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Behavioral Signature */}
      <div className="pt-2 border-t border-light-gray space-y-1.5">
        <span className="text-[11px] font-bold text-dark-black/80 uppercase tracking-wider">
          Persona Archetype:
        </span>
        <p className="text-xs text-medium-black leading-relaxed">
          High-conviction authority with rapid objection pivoting and high-trust consultative closing.
        </p>
      </div>
    </div>
  );
};

export default AiDnaRadarCard;

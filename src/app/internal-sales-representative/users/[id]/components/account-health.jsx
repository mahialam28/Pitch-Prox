"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

const healthMetrics = [
  { id: "usage", label: "Usage", score: 95, max: 100 },
  { id: "engagement", label: "Engagement", score: 90, max: 100 },
  { id: "billing", label: "Billing", score: 95, max: 100 },
  { id: "retention", label: "Retention", score: 88, max: 100 },
];

const AccountHealth = ({
  score = 92,
  maxScore = 100,
  status = "Healthy",
  lastCalculated = "May 16, 2025, 10:30 AM",
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* ── Header: Title & Chevron ── */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight">
          Account Health
        </h3>
        <button
          type="button"
          className="p-1 rounded-lg hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Big Score & Status ── */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-primary font-secondary tracking-tight">
              {score}
            </span>
            <span className="text-sm font-semibold text-light-black">
              / {maxScore}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            {status}
          </span>
        </div>
        <p className="text-[11px] text-light-black font-normal">
          Last calculated: {lastCalculated}
        </p>
      </div>

      {/* ── Smooth Sparkline Trend Chart ── */}
      <div className="w-full h-12 my-1 relative">
        <svg
          viewBox="0 0 300 60"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="healthGradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EADAB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0EADAB" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Area Fill */}
          <path
            d="M 0 45 Q 60 40, 120 48 T 200 32 T 300 20 L 300 60 L 0 60 Z"
            fill="url(#healthGradientId)"
          />
          {/* Stroke Line */}
          <path
            d="M 0 45 Q 60 40, 120 48 T 200 32 T 300 20"
            fill="none"
            stroke="#0EADAB"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── 2x2 Progress Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 text-xs">
        {healthMetrics.map((metric) => (
          <div key={metric.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-light-black font-medium">{metric.label}</span>
              <span className="font-bold text-dark-black/85 font-secondary text-[11px]">
                {metric.score}
                <span className="font-normal text-light-black">/{metric.max}</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-light-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(metric.score / metric.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountHealth;

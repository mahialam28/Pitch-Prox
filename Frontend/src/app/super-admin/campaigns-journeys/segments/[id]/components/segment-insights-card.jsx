"use client";

import React from "react";

export default function SegmentInsightsCard({ insights }) {
  const percentage = insights?.subscriptionRate || 72;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
          Segment Insights
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* Left: Circular Donut Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
            {/* Background Track */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="12"
            />
            {/* Progress Arc */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="transparent"
              stroke="#0EADAB"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-dark-black font-secondary leading-none">
              {percentage}%
            </span>
            <span className="text-[10px] font-semibold text-light-black uppercase tracking-wider mt-1">
              Subscriptions
            </span>
          </div>
        </div>

        {/* Right: Metrics Key-Values */}
        <div className="flex flex-col gap-3.5 w-full sm:w-auto min-w-[160px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-light-black font-normal">
              Avg. Trust Gain
            </span>
            <span className="text-xs font-bold text-emerald-600 font-secondary">
              {insights?.avgTrustGain || "+24"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-light-black font-normal">
              Prompt Adherence
            </span>
            <span className="text-xs font-bold text-emerald-600 font-secondary">
              {insights?.promptAdherence || "89%"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-light-black font-normal">
              Last 7 days
            </span>
            <span className="text-xs font-bold text-emerald-600 font-secondary">
              {insights?.last7DaysLeads || "+46 leads"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

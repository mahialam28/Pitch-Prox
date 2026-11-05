"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function TeamPerformance() {
  const categories = [
    {
      name: "Elite (100%+)",
      count: 14,
      color: "#10B981",
      dotClass: "bg-emerald-500",
    },
    {
      name: "Strong (75-99%)",
      count: 16,
      color: "#3B82F6",
      dotClass: "bg-blue-500",
    },
    {
      name: "Developing (40-74%)",
      count: 10,
      color: "#F59E0B",
      dotClass: "bg-amber-500",
    },
    {
      name: "At Risk (<40%)",
      count: 8,
      color: "#EF4444",
      dotClass: "bg-rose-500",
    },
  ];

  const total = 48;

  // Compute SVG circle strokes for 4 segments
  // Circumference = 2 * PI * r = 2 * PI * 42 ~= 263.89
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = categories.map((cat) => {
    const percent = cat.count / total;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/85 tracking-tight">
          Team Performance
        </h3>
        <span className="text-xs font-normal text-light-black">
          (This Month)
        </span>
      </div>

      {/* Donut Chart with Centered Total */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="10"
            />
            {/* Colored Segment Rings */}
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="10"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-bold text-dark-black/90 leading-tight font-secondary">
              48
            </span>
            <span className="text-[9px] font-semibold text-light-black uppercase tracking-wider">
              Total Reps
            </span>
          </div>
        </div>
      </div>

      {/* Legend / Breakdown List */}
      <div className="space-y-2.5 mt-3 pt-3 border-t border-light-gray/60">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cat.dotClass}`} />
              <span className="text-light-black font-normal text-xs">
                {cat.name}
              </span>
            </div>
            <span className="font-bold text-dark-black/80 font-secondary text-xs">
              {cat.count}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Link */}
      <div className="mt-4 pt-3 border-t border-light-gray/60">
        <Link
          href="/super-admin/performance-analytics"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <span>View Full Analytics</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

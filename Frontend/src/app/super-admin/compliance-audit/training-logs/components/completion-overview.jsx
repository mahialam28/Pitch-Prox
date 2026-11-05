"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

// Status totals use exactly the four Training statuses and add up to Total Assignments (256)
const SEGMENTS = [
  { label: "Completed", count: 187, color: "#0EADAB" },
  { label: "In Progress", count: 35, color: "#F79009" },
  { label: "Not Started", count: 17, color: "#A5B1B5" },
  { label: "Overdue", count: 17, color: "#F04438" },
];
const TOTAL = SEGMENTS.reduce((sum, segment) => sum + segment.count, 0);

export default function CompletionOverview({ onActionClick }) {
  const radius = 44;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const completedPercent = Math.round((SEGMENTS[0].count / TOTAL) * 100);
  // Each arc starts where the previous one ended
  const arcs = SEGMENTS.reduce((list, segment) => {
    const start = list.length ? list[list.length - 1].end : 0;
    const length = (segment.count / TOTAL) * circumference;
    return [...list, { ...segment, start, length, end: start + length }];
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
          Training Completion Overview
        </h3>
        <button
          type="button"
          onClick={() => onActionClick?.("view_report")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer transition-colors"
        >
          View report
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body: Donut Chart + Legend */}
      <div className="flex items-center justify-between gap-6 py-1">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r={radius} fill="transparent" stroke="#F3F4F6" strokeWidth={strokeWidth} />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx="55"
                cy="55"
                r={radius}
                fill="transparent"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                strokeDashoffset={-arc.start}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-dark-black font-secondary leading-none">{completedPercent}%</span>
            <span className="text-[10px] font-semibold text-light-black mt-1 uppercase tracking-wider">Completed</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {SEGMENTS.map((segment) => (
            <div key={segment.label} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
                <span className="text-medium-black font-medium">{segment.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 font-secondary">
                <span className="font-bold text-dark-black">{segment.count}</span>
                <span className="text-light-black text-[11px]">({Math.round((segment.count / TOTAL) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

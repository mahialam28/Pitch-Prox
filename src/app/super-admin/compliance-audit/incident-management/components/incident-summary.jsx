"use client";

import React from "react";

// summary: [{ status, count }] for Open / Investigating / Resolved / Closed (adds up to Total Incidents)
const COLORS = { Open: "#F04438", Investigating: "#F97316", Resolved: "#0EADAB", Closed: "#38BDF8" };

export default function IncidentSummary({ summary }) {

  // Statuses: Open, Investigating, Resolved, Closed (they add up to Total Incidents)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const SLICES = (summary ?? []).map((item) => ({ label: item.status, count: item.count, color: COLORS[item.status] }));
  const total = SLICES.reduce((sum, slice) => sum + slice.count, 0);
  const share = (count) => (total ? Math.round((count / total) * 100) : 0);
  const arcs = SLICES.reduce((list, slice) => {
    const start = list.length ? list[list.length - 1].end : 0;
    const length = total ? (slice.count / total) * circumference : 0;
    return [...list, { ...slice, start, length, end: start + length }];
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-bold text-dark-black font-secondary">
          Incident Summary
        </h3>

        <span className="text-xs text-light-black">All time</span>
      </div>

      {/* Donut Chart & Legend */}
      <div className="flex items-center justify-between gap-4 mt-2">
        {/* SVG Donut */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background track circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="10"
            />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={arc.color}
                strokeWidth="10"
                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                strokeDashoffset={-arc.start}
                className="transition-all duration-500"
              />
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-dark-black font-secondary leading-none">
              {total}
            </span>
            <span className="text-[9px] font-semibold text-light-black uppercase tracking-wider mt-0.5">
              TOTAL
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 min-w-0 pr-1">
          {SLICES.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="text-medium-black text-xs">{slice.label}</span>
              </div>
              <span className="font-semibold text-dark-black text-xs shrink-0">
                {slice.count} <span className="text-light-black font-normal">({share(slice.count)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

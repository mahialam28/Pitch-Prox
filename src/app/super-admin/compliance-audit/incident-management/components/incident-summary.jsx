"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function IncidentSummary() {
  const [timeframe, setTimeframe] = useState("This Month");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  const timeframeOptions = ["This Month", "Last 30 Days", "This Quarter", "This Year"];

  // Statuses: Open, Investigating, Resolved, Closed (they add up to Total Incidents)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const SLICES = [
    { label: "Open", count: 4, color: "#F04438" },
    { label: "Investigating", count: 3, color: "#F97316" },
    { label: "Resolved", count: 13, color: "#0EADAB" },
    { label: "Closed", count: 18, color: "#38BDF8" },
  ];
  const total = SLICES.reduce((sum, slice) => sum + slice.count, 0);
  const arcs = SLICES.reduce((list, slice) => {
    const start = list.length ? list[list.length - 1].end : 0;
    const length = (slice.count / total) * circumference;
    return [...list, { ...slice, start, length, end: start + length }];
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-bold text-dark-black font-secondary">
          Incident Summary
        </h3>

        {/* Timeframe selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-medium-black hover:text-dark-black rounded-lg border border-light-gray bg-light-gray/30 hover:bg-light-gray/60 transition-colors cursor-pointer"
          >
            <span>{timeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-light-black" />
          </button>

          {isTimeframeOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-light-gray rounded-xl shadow-lg py-1 z-20">
              {timeframeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setTimeframe(opt);
                    setIsTimeframeOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    timeframe === opt
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-dark-black/80 hover:bg-light-gray/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
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
                {slice.count} <span className="text-light-black font-normal">({Math.round((slice.count / total) * 100)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

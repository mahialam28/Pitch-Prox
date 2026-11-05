"use client";

import React from "react";
import { Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Tooltip from "@/components/modals/tooltip";

const data = [
  { name: "Appointment Set", value: 48, percentage: "31%", color: "#10b981" },
  { name: "Follow-Up Required", value: 36, percentage: "23%", color: "#3b82f6" },
  { name: "Information Requested", value: 24, percentage: "15%", color: "#6366f1" },
  { name: "Not Interested", value: 18, percentage: "12%", color: "#f43f5e" },
  { name: "No Answer", value: 16, percentage: "10%", color: "#94a3b8" },
  { name: "Voicemail", value: 14, percentage: "9%", color: "#f59e0b" },
];

export const CallOutcome = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-dark-black/80">
          Call Outcome Distribution
        </h2>
        <Tooltip
          title="Call Outcome Distribution"
          text="Displays the distribution of conversation outcomes across all analyzed calls, giving you a clear view of how your conversations are progressing and where opportunities are most commonly gained or lost."
        >
          <Info
            tabIndex={0}
            aria-label="More about Call Outcome Distribution"
            className="w-4 h-4 text-medium-black/70 shrink-0 transition-colors duration-200 hover:text-primary outline-none"
          />
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Donut Chart with Center Text */}
        <div className="sm:col-span-6 relative h-[200px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl sm:text-3xl font-extrabold text-dark-black/90 tracking-tight">
              156
            </span>
            <span className="text-[10px] font-bold text-light-black tracking-wider uppercase mt-0.5">
              TOTAL LEADS
            </span>
          </div>
        </div>

        {/* Legend & Stat Breakdown */}
        <div className="sm:col-span-6 space-y-2.5">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-dark-black/70 truncate">
                  {item.name}
                </span>
              </div>
              <div className="font-bold text-dark-black/90 shrink-0 ml-2">
                <span>{item.percentage}</span>
                <span className="text-light-black font-semibold ml-0.5">
                  ({item.value})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CallOutcome;
"use client";

import React from "react";
import { Info, ArrowUpRight } from "lucide-react";
import Tooltip from "@/components/modals/tooltip";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { dateRangeOptions } from "@/utils.js/lead-options";

const trustData = [
  { day: "Mon", you: 15, baseline: 30 },
  { day: "Tue", you: 28, baseline: 30 },
  { day: "Wed", you: 24, baseline: 30 },
  { day: "Thu", you: 45, baseline: 30 },
  { day: "Fri", you: 58, baseline: 30 },
  { day: "Sat", you: 72, baseline: 30 },
  { day: "Sun", you: 85, baseline: 30 },
];

export const TrustProgression = ({ dateRange = "This Month", onDateRangeChange }) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 leading-tight">
            Trust<br />Progression
          </h2>
          <Tooltip
            title="Trust Progression"
            text="Visualizes how trust developed throughout your analyzed conversations. Monitoring trust progression over time can help you recognize communication patterns that strengthen—or weaken—your conversations."
            className="self-start mt-1"
          >
            <Info
              tabIndex={0}
              aria-label="More about Trust Progression"
              className="w-4 h-4 text-medium-black/70 shrink-0 transition-colors duration-200 hover:text-primary outline-none"
            />
          </Tooltip>
        </div>

        <Dropdown
          label="This Month"
          items={dateRangeOptions}
          selected={dateRange}
          onSelect={onDateRangeChange}
          variant="default"
        />
      </div>

      {/* Main Stat & Growth Pill */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-3xl sm:text-4xl font-bold text-dark-black/90 tracking-tight">
          +21 pts
        </span>
        <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
          <ArrowUpRight className="w-4 h-4" />
          <span>214% vs baseline</span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-[180px] w-full text-xs font-semibold text-light-black">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trustData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeWidth={1} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              dy={10}
              tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 500 }}
            />
            <YAxis hide domain={[0, 100]} />

            {/* Baseline Line */}
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#F1F5F9"
              strokeWidth={2}
              dot={false}
            />

            {/* User Trust Progression Line */}
            <Line
              type="monotone"
              dataKey="you"
              stroke="#0EADAB"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs font-semibold text-light-black">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-light-gray bg-white" />
          <span>Baseline</span>
        </div>
      </div>
    </div>
  );
};

export default TrustProgression;
"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from "recharts";
import { Clock, Info } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Tooltip from "@/components/modals/tooltip";
import { displayIntervalOptions } from "@/utils.js/lead-options";

const data = [
  { day: "MON", you: 24, average: 32, fullDate: "Mon, May 12" },
  { day: "TUE", you: 30, average: 31, fullDate: "Tue, May 13" },
  { day: "WED", you: 37, average: 35, fullDate: "Wed, May 14" },
  { day: "THU", you: 15, average: 30, fullDate: "Thu, May 15" },
  { day: "FRI", you: 22, average: 29, fullDate: "Fri, May 16" },
  { day: "SAT", you: 45, average: 35, fullDate: "Sat, May 17" },
  { day: "SUN", you: 58, average: 42, fullDate: "Sun, May 18" },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const chartData = payload[0].payload;
    return (
      <div className="relative bottom-10 bg-dark-teal text-white px-3.5 py-2 rounded-xl shadow-xl flex flex-col items-center justify-center min-w-[120px]">
        <span className="text-[10px] text-white/70 font-medium">
          {chartData.fullDate}
        </span>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="flex items-center gap-1 font-bold text-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-300" />
            You: {chartData.you}%
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-200">
            <span className="w-2 h-0.5 bg-slate-300" />
            Benchmark: {chartData.average}%
          </span>
        </div>
        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-dark-teal" />
      </div>
    );
  }
  return null;
};

export const PerformanceTrend = ({
  dateRange = "This Month",
  interval = "Weekly",
  onIntervalChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm w-full flex flex-col justify-between">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80">
            Performance Trend{" "}
            <span className="text-light-black font-medium">({dateRange})</span>
          </h2>
          <Clock className="w-4 h-4 text-light-black shrink-0" />
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            label="Conversion Momentum"
            items={[
              { value: "Conversion Momentum", label: "Conversion Momentum" },
              { value: "Prompt Adherence", label: "Prompt Adherence" },
              { value: "Trust Gain", label: "Trust Gain" },
              { value: "Overall Score", label: "Overall Score" },
            ]}
            selected="Conversion Momentum"
            variant="default"
          />

          <Dropdown
            label="Weekly"
            items={displayIntervalOptions}
            selected={interval}
            onSelect={onIntervalChange}
            variant="default"
          />
        </div>
      </div>

      {/* Recharts Chart */}
      <div className="h-[220px] sm:h-[260px] w-full text-xs font-semibold text-light-black">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeWidth={1} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              dy={15}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }}
            />
            <ChartTooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#CBD5E1", strokeDasharray: "3 3", strokeWidth: 1 }}
              position={{ y: 40 }}
            />

            {/* Average Line */}
            <Line
              type="monotone"
              dataKey="average"
              stroke="#A5B1B5"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />

            {/* Main User Line */}
            <Line
              type="monotone"
              dataKey="you"
              stroke="#0EADAB"
              strokeWidth={2.5}
              dot={{ fill: "#0EADAB", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#0EADAB" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 mt-6 text-xs sm:text-sm font-semibold text-dark-black/70">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span>You</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <span className="w-1.5 h-0.5 bg-light-black rounded-full" />
            <span className="w-1.5 h-0.5 bg-light-black rounded-full" />
            <span className="w-1.5 h-0.5 bg-light-black rounded-full" />
          </div>
          <span>PitchProX Benchmark</span>
          <Tooltip
            title="PitchProX Benchmark"
            text="The average performance of qualifying PitchProX calls for this metric. Benchmarks are calculated automatically from aggregated platform data and updated as additional qualifying calls are completed."
            position="top"
            align="center"
            maxWidth={320}
            className="p-0 -m-0 hover:bg-transparent"
          >
            <Info className="w-3.5 h-3.5 text-light-black/70 hover:text-primary transition-colors cursor-pointer" />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTrend;
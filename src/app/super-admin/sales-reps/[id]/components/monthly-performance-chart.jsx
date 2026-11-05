"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const chartData = [
  { day: "May 1", calls: 12, closed: 2, target: 15, cumulative: 2 },
  { day: "May 3", calls: 18, closed: 3, target: 15, cumulative: 5 },
  { day: "May 5", calls: 14, closed: 2, target: 15, cumulative: 7 },
  { day: "May 7", calls: 16, closed: 4, target: 15, cumulative: 11 },
  { day: "May 10", calls: 15, closed: 3, target: 15, cumulative: 14 },
  { day: "May 12", calls: 20, closed: 5, target: 15, cumulative: 19 },
  { day: "May 15", calls: 17, closed: 4, target: 15, cumulative: 23 },
  { day: "May 17", calls: 19, closed: 5, target: 15, cumulative: 28 },
  { day: "May 20", calls: 22, closed: 6, target: 15, cumulative: 34 },
  { day: "May 22", calls: 21, closed: 5, target: 15, cumulative: 39 },
  { day: "May 25", calls: 24, closed: 7, target: 15, cumulative: 46 },
  { day: "May 27", calls: 23, closed: 6, target: 15, cumulative: 52 },
  { day: "May 31", calls: 18, closed: 4, target: 15, cumulative: 56 },
];

export default function MonthlyPerformanceChart({ rep }) {
  const quotaPercent = 112;
  const currentClosed = 56;
  const targetQuota = 50;
  const remaining = Math.max(0, targetQuota - currentClosed);

  // SVG Gauge calculation for full circle
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, quotaPercent) / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      {/* Chart Header + Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">
            Monthly Performance
          </h3>
          <span className="text-xs text-light-black font-normal">
            (May 1 – May 31, 2025)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-light-black font-medium flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#22E2B9]" />
            <span>Calls</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-primary" />
            <span>Subscription Closed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-medium-teal" />
            <span>Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-dark-black" />
            <span>Closed (Cumulative)</span>
          </div>
        </div>
      </div>

      {/* Main Container: Left Chart + Right Circular Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Dual-Axis Chart */}
        <div className="lg:col-span-8 w-full h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: "#F1F5F9" }}
                tick={{ fill: "#A5B1B5", fontSize: 10 }}
              />
              {/* Left Y Axis for Daily Calls */}
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                domain={[0, 30]}
                ticks={[0, 10, 20, 30]}
                tick={{ fill: "#A5B1B5", fontSize: 10 }}
              />
              {/* Right Y Axis for Cumulative Deals */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                domain={[0, 80]}
                ticks={[0, 20, 40, 60, 80]}
                tick={{ fill: "#A5B1B5", fontSize: 10 }}
              />
              {/* Tooltip lists the series in legend order: Calls, Subscription Closed, Target, then Closed (Cumulative) */}
              <Tooltip
                itemSorter={(item) => ["calls", "closed", "target", "cumulative"].indexOf(item.dataKey)}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid #F5F5F5",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "11px",
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="calls"
                name="Calls"
                fill="#22E2B9"
                barSize={7}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="closed"
                name="Subscription Closed"
                fill="#0EADAB"
                barSize={7}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#4A7F91"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                name="Closed (Cumulative)"
                stroke="#080C1D"
                strokeWidth={3}
                dot={{ fill: "#080C1D", r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side: Quota Progress Circular Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-t lg:border-t-0 lg:border-l border-light-gray">
          <span className="text-xs font-bold text-dark-black/85 mb-3">
            Quota Progress
          </span>

          {/* SVG Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="9"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#0EADAB"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-dark-black/90 font-secondary leading-none">
                {quotaPercent}%
              </span>
              <span className="text-[10px] text-light-black font-semibold mt-1">
                {currentClosed} / {targetQuota}
              </span>
              <span className="text-[9px] text-light-black uppercase tracking-wider">
                Subscriptions
              </span>
            </div>
          </div>

          {/* Bottom stats: Monthly Target | Remaining */}
          <div className="grid grid-cols-2 gap-4 w-full text-center mt-3 pt-3 border-t border-light-gray">
            <div>
              <span className="block text-[10px] font-semibold text-light-black uppercase tracking-wider">
                Monthly Target
              </span>
              <span className="text-sm font-bold text-dark-black/90 font-secondary">
                {targetQuota}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-light-black uppercase tracking-wider">
                Remaining
              </span>
              <span className="text-sm font-bold text-dark-black/90 font-secondary">
                {remaining}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

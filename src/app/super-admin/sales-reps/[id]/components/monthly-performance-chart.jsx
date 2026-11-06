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
import { dollars } from "../../team-api";

// This month day by day: accounts closed (bars), booked revenue so far (line) and the
// straight-line pace to the quota (dashed). Calls appear once calling is connected.
export default function MonthlyPerformanceChart({ rep, daily = [], monthLabel }) {
  const quota = rep.quotaCents == null ? null : rep.quotaCents / 100;
  const chartData = daily.map((day) => ({
    day: day.label,
    closed: day.closed,
    cumulative: Math.round(day.cumulativeCents / 100),
    ...(quota != null && { target: Math.round((quota * day.day) / daily.length) }),
  }));
  const quotaPercent = rep.attainment ?? 0;
  const remaining = quota == null ? null : Math.max(0, quota - rep.revenueCents / 100);

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
            ({monthLabel})
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-light-black font-medium flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-primary" />
            <span>Accounts Closed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-medium-teal" />
            <span>Quota Pace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-dark-black" />
            <span>Booked Revenue (Cumulative)</span>
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
                allowDecimals={false}
                tick={{ fill: "#A5B1B5", fontSize: 10 }}
              />
              {/* Right Y Axis for Cumulative Deals */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`}
                tick={{ fill: "#A5B1B5", fontSize: 10 }}
              />
              {/* Tooltip lists the series in legend order: Calls, Subscription Closed, Target, then Closed (Cumulative) */}
              <Tooltip
                itemSorter={(item) => ["closed", "target", "cumulative"].indexOf(item.dataKey)}
                formatter={(value, name) => (name === "Accounts Closed" ? value : `$${Number(value).toLocaleString("en-US")}`)}
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
                dataKey="closed"
                name="Accounts Closed"
                fill="#0EADAB"
                barSize={7}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="target"
                name="Quota Pace"
                stroke="#4A7F91"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                name="Booked Revenue"
                stroke="#080C1D"
                strokeWidth={3}
                dot={false}
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
                {quota == null ? "—" : `${quotaPercent}%`}
              </span>
              <span className="text-[10px] text-light-black font-semibold mt-1">
                {dollars(rep.revenueCents)} / {dollars(rep.quotaCents)}
              </span>
              <span className="text-[9px] text-light-black uppercase tracking-wider">
                {quota == null ? "No quota set" : "Booked revenue"}
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
                {dollars(rep.quotaCents)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-light-black uppercase tracking-wider">
                Remaining
              </span>
              <span className="text-sm font-bold text-dark-black/90 font-secondary">
                {remaining == null ? "—" : `$${Math.round(remaining).toLocaleString("en-US")}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

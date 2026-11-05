"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const trendData = [
  { name: "Week 1", calls: 24, aiScore: 16 },
  { name: "Week 2", calls: 48, aiScore: 32 },
  { name: "Week 3", calls: 68, aiScore: 45 },
  { name: "Week 4", calls: 82, aiScore: 54 },
  { name: "Week 5", calls: 96, aiScore: 70 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-black/90 text-white text-xs rounded-xl p-3 shadow-lg border border-white/10 backdrop-blur-md">
        <p className="font-bold text-white mb-1.5">{label}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-white/80">Calls:</span>
            <span className="font-bold">{payload[0]?.value}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-white/80">AI Score:</span>
            <span className="font-bold">{payload[1]?.value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PerformanceTrendChart() {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header & Legend */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary">
          Performance Trend
        </h3>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-dark-black/80">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Calls</span>
          </div>
          <div className="flex items-center gap-1.5 text-dark-black/80">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>AI Score</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Calls Line */}
            <Line
              type="monotone"
              dataKey="calls"
              stroke="#0EADAB"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#0EADAB",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, fill: "#0EADAB" }}
            />

            {/* AI Score Line */}
            <Line
              type="monotone"
              dataKey="aiScore"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#3B82F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

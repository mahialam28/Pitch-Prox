"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const cancellationReasonsData = [
  {
    id: "expensive",
    name: "Too Expensive",
    percentage: "32%",
    value: 32,
    color: "#991B1B", // Dark Red
  },
  {
    id: "low-usage",
    name: "Low Usage",
    percentage: "24%",
    value: 24,
    color: "#EF4444", // Red
  },
  {
    id: "not-enough-value",
    name: "Not Enough Value",
    percentage: "16%",
    value: 16,
    color: "#F87171", // Light Red
  },
  {
    id: "found-alternative",
    name: "Found Alternative",
    percentage: "12%",
    value: 12,
    color: "#C2410C", // Dark Orange
  },
  {
    id: "confusing-to-use",
    name: "Confusing to Use",
    percentage: "10%",
    value: 10,
    color: "#F97316", // Orange
  },
  {
    id: "other",
    name: "Other",
    percentage: "6%",
    value: 6,
    color: "#FDBA74", // Light Orange
  },
];

export const TopCancellations = () => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="shrink-0 mb-2">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Top Cancellation Reasons
        </h3>
      </div>

      {/* Main Content: Centered Donut Chart & Legend (Static without hover effects) */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-auto py-4 w-full pointer-events-auto">
        {/* Enriched & Bigger Donut Chart with Centered Total */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cancellationReasonsData}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={2.5}
                dataKey="value"
                strokeWidth={0}
                isAnimationActive={false}
              >
                {cancellationReasonsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-dark-black/80 leading-none tracking-tight">
              156
            </span>
            <span className="text-[10px] font-bold text-medium-black uppercase tracking-wider mt-1.5">
              OVERALL CHURN RATE
            </span>
          </div>
        </div>

        {/* Legend List (Static without hover dimming) */}
        <div className="flex flex-col gap-3 w-full min-w-[190px] max-w-[260px]">
          {cancellationReasonsData.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs sm:text-sm py-0.5"
            >
              {/* Reason Name with Dot */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-medium-black font-medium truncate">
                  {item.name}
                </span>
              </div>

              {/* Percentage */}
              <span className="font-bold text-dark-black/80 whitespace-nowrap">
                {item.percentage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCancellations;


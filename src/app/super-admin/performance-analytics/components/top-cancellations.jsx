"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#FF4842", "#F59E0B", "#6366F1", "#0EADAB", "#3B82F6", "#94A3B8"];

// Live: the reasons picked when a subscription is cancelled (customer detail → Cancel Subscription)
export const TopCancellations = ({ cancellations, churnRate }) => {
  const total = cancellations?.total ?? 0;
  const cancellationReasonsData = (cancellations?.reasons ?? []).map((row, index) => ({
    id: row.reason,
    name: row.reason,
    value: row.count,
    color: COLORS[index % COLORS.length],
    percentage: `${row.count} (${total ? Math.round((row.count / total) * 100) : 0}%)`,
  }));
  const chartData = cancellationReasonsData.length ? cancellationReasonsData : [{ id: "none", value: 1, color: "#EEF0F2" }];
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="shrink-0 mb-2">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Top Cancellation Reasons
        </h3>
      </div>

      {/* Main Content: Centered Donut Chart & Legend */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-auto py-4 w-full pointer-events-auto">
        {/* Donut Chart with Centered Total */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={chartData.length > 1 ? 2.5 : 0}
                dataKey="value"
                strokeWidth={0}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
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
              {churnRate == null ? "—" : `${churnRate}%`}
            </span>
            <span className="text-[10px] font-bold text-medium-black uppercase tracking-wider mt-1.5">
              CHURN (30 DAYS)
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-3 w-full min-w-[190px] max-w-[260px]">
          {!cancellationReasonsData.length && <p className="text-xs text-light-black">No cancellations yet.</p>}
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

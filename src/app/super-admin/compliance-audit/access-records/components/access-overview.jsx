"use client";

import React from "react";

const ROLE_COLORS = {
  super_admin: "#8B5CF6",
  admin_manager: "#3B82F6",
  support: "#0EADAB",
  auditor: "#F97316",
  sales_rep: "#EC4899",
};

// roles: [{ role, label, count }] from /api/v1/admin/employees/stats
export default function AccessOverview({ roles = [] }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const total = roles.reduce((sum, item) => sum + item.count, 0);
  const slices = roles.map((item) => {
    const p = total ? item.count / total : 0;
    return { label: item.label, count: item.count, p, percentage: `${(p * 100).toFixed(1)}%`, color: ROLE_COLORS[item.role] ?? "#94A3B8" };
  });

  // Each slice starts where the previous one ended (computed up front, not while rendering)
  const offsets = slices.reduce((list, slice, index) => [...list, index === 0 ? 0 : list[index - 1] - slices[index - 1].p * circumference], []);

  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <h3 className="text-sm font-bold text-dark-black/90 font-secondary">
        Overview
      </h3>

      {/* SVG Donut */}
      <div className="flex justify-center py-1">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="11"
            />
            {slices.map((slice, index) => {
              const strokeLen = slice.p * circumference;
              const currentOffset = offsets[index];

              return (
                <circle
                  key={slice.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="11"
                  strokeDasharray={`${strokeLen} ${circumference - strokeLen}`}
                  strokeDashoffset={currentOffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-dark-black font-secondary leading-none">
              {total}
            </span>
            <span className="text-[9px] font-semibold text-light-black uppercase tracking-wider mt-0.5">
              TOTAL USERS
            </span>
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-2 pt-1 border-t border-light-gray/60">
        {slices.map((slice) => (
          <div
            key={slice.label}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-medium-black text-xs truncate">
                {slice.label}
              </span>
            </div>
            <div className="text-right text-xs shrink-0">
              <span className="font-semibold text-dark-black/90">
                {slice.count}{" "}
              </span>
              <span className="text-light-black text-[11px]">
                ({slice.percentage})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

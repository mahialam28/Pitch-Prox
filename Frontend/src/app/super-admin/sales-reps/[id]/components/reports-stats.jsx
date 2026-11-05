import React from "react";

const stats = [
  {
    label: "REPORTS GENERATED",
    value: "36",
    subtitle: "12 generated this month",
    isPositive: true,
  },
  {
    label: "HIGH-SCORE REPORTS",
    value: "24",
    subtitle: "67% scored 85 or above",
    isPositive: true,
  },
  {
    label: "AVERAGE SCORE",
    value: "88",
    subtitle: "↑ 5 pts in the last 30 days",
    isPositive: true,
  },
  {
    label: "LAST REPORT",
    value: "Jun 18, 2026",
    subtitle: "Generated 42 minutes ago",
    isPositive: true,
  },
];

export default function ReportsStats({ customStats }) {
  const displayStats = customStats || stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {displayStats.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-5 border border-light-gray shadow-xs flex flex-col justify-between gap-1.5"
        >
          {/* Stat Label */}
          <span className="text-[11px] font-bold text-light-black tracking-wider uppercase">
            {item.label}
          </span>

          {/* Stat Value */}
          <div className="mt-0.5">
            <h3 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">
              {item.value}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>{item.subtitle}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

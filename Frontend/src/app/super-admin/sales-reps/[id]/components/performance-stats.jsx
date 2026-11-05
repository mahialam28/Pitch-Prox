import React from "react";

const stats = [
  {
    label: "TOTAL CALLS",
    value: "248",
    trend: "12.4% vs previous period",
    positive: true,
  },
  {
    label: "CONVERSION RATE",
    value: "18.6%",
    trend: "2.1 pts vs previous period",
    positive: true,
  },
  {
    label: "AVG. AI SCORE",
    value: "88 / 100",
    trend: "4 pts vs previous period",
    positive: true,
  },
  {
    label: "REVENUE INFLUENCED",
    value: "$124,850",
    trend: "9.8% vs previous period",
    positive: true,
  },
];

export default function PerformanceStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-3.5 sm:p-4 border border-light-gray shadow-xs flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
            {item.label}
          </span>
          <div className="mt-1.5">
            <h3 className="text-2xl font-bold text-dark-black/90 font-secondary tracking-tight">
              {item.value}
            </h3>
            <p className="text-[10.5px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑</span>
              <span>{item.trend}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

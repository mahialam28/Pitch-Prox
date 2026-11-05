"use client";

import React from "react";

export default function FailedDeliveriesSection() {
  const stats = [
    {
      id: "bounced",
      value: "42",
      label: "BOUNCED",
      valueColor: "text-red",
    },
    {
      id: "unsub",
      value: "18",
      label: "UNSUB",
      valueColor: "text-orange-500",
    },
    {
      id: "spam",
      value: "6",
      label: "SPAM",
      valueColor: "text-dark-black/80",
    },
    {
      id: "blocked",
      value: "3",
      label: "BLOCKED",
      valueColor: "text-dark-black/80",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Failed Deliveries
        </h3>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-4 gap-2 text-center items-center divide-x divide-light-gray/60">
        {stats.map((item) => (
          <div key={item.id} className="flex flex-col items-center justify-center px-1">
            <span
              className={`text-xl font-bold font-secondary leading-none ${item.valueColor}`}
            >
              {item.value}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider mt-1.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

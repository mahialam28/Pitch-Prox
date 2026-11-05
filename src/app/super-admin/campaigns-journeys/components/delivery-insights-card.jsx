"use client";

import React from "react";

export default function DeliveryInsightsCard() {
  const percentage = 98;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const metrics = [
    { label: "Delivered", value: "98.1%" },
    { label: "Bounced", value: "1.2%" },
    { label: "Unsubscribed", value: "0.4%" },
    { label: "Spam", value: "0.3%" },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
          Segment Insights
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-1">
        {/* Left: Donut Gauge Chart */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
            {/* Background Track */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="12"
            />
            {/* Progress Arc */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="transparent"
              stroke="#0EADAB"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-dark-black font-secondary leading-none">
              {percentage}%
            </span>
            <span className="text-[10px] font-semibold text-light-black uppercase tracking-wider mt-1">
              Delivered
            </span>
          </div>
        </div>

        {/* Right: Key Delivery Stats */}
        <div className="flex flex-col gap-2.5 w-full sm:w-auto min-w-[150px]">
          {metrics.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="text-light-black font-normal">
                {item.label}
              </span>
              <span className="font-bold text-dark-black/90 font-secondary text-xs">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

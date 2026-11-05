"use client";

import React from "react";
import Text from "@/components/texts/text";

const InternalAnalyticsCard = ({
  activeUsers = 0,
  totalSales = 0,
  revenue = "$0.00",
  conversionRate = "0%",
}) => {
  const metrics = [
    { label: "ACTIVE USERS", value: activeUsers },
    { label: "TOTAL SALES", value: totalSales },
    { label: "REVENUE", value: revenue },
    { label: "CONVERSION RATE", value: conversionRate },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
          Internal Analytics
        </h3>
        <span className="text-xs text-light-black font-normal">
          (After Publishing)
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-light-gray bg-light-gray/20 flex flex-col items-center justify-center text-center space-y-1"
          >
            <span className="text-lg sm:text-xl font-bold text-dark-black/80 font-secondary leading-none">
              {metric.value}
            </span>
            <span className="text-[9px] font-medium text-light-black tracking-wider uppercase leading-tight">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Text */}
      <p className="text-center text-[11px] text-light-black font-normal pt-1">
        Metrics will appear once the playbook is published.
      </p>
    </div>
  );
};

export default InternalAnalyticsCard;

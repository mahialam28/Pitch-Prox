"use client";

import React, { useState } from "react";
import { Lock, UserX, CreditCard, ChevronDown } from "lucide-react";

export default function IncidentsByCategory() {
  const [timeframe, setTimeframe] = useState("This Month");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  const timeframeOptions = ["This Month", "Last 30 Days", "This Quarter", "This Year"];

  const categories = [
    {
      id: "security",
      label: "Security Incident",
      count: 12,
      percentage: "31%",
      barWidth: "31%",
      icon: Lock,
      iconColor: "text-purple-600",
      barColor: "bg-purple-500",
    },
    {
      id: "unauthorized",
      label: "Unauthorized Access",
      count: 9,
      percentage: "24%",
      barWidth: "24%",
      icon: UserX,
      iconColor: "text-orange-500",
      barColor: "bg-orange-500",
    },
    {
      id: "payment",
      label: "Payment / Billing Abuse",
      count: 5,
      percentage: "13%",
      barWidth: "13%",
      icon: CreditCard,
      iconColor: "text-emerald-500",
      barColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-bold text-dark-black font-secondary">
          Top Incident Categories
        </h3>

        {/* Timeframe selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-medium-black hover:text-dark-black rounded-lg border border-light-gray bg-light-gray/30 hover:bg-light-gray/60 transition-colors cursor-pointer"
          >
            <span>{timeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-light-black" />
          </button>

          {isTimeframeOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-light-gray rounded-xl shadow-lg py-1 z-20">
              {timeframeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setTimeframe(opt);
                    setIsTimeframeOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    timeframe === opt
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-dark-black/80 hover:bg-light-gray/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Rows */}
      <div className="flex flex-col gap-3.5 mt-2">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          return (
            <div key={cat.id} className="flex items-center justify-between gap-3 text-xs">
              {/* Icon & Label */}
              <div className="flex items-center gap-2 w-36 sm:w-40 shrink-0">
                <IconComp className={`w-4 h-4 ${cat.iconColor} shrink-0`} />
                <span className="text-dark-black/85 font-medium truncate">
                  {cat.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 bg-light-gray/80 h-2 rounded-full overflow-hidden mx-1">
                <div
                  className={`h-full ${cat.barColor} rounded-full transition-all duration-500`}
                  style={{ width: cat.barWidth }}
                />
              </div>

              {/* Count & Percentage */}
              <div className="text-right text-xs shrink-0 w-14">
                <span className="font-semibold text-dark-black">{cat.count} </span>
                <span className="text-light-black text-[11px]">({cat.percentage})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

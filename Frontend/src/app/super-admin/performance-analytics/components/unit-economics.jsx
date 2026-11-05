"use client";

import React from "react";
import {
  Phone,
  Zap,
  BarChart3,
  UserPlus,
  Compass,
  User,
  ArrowUp,
} from "lucide-react";

const unitEconomicsData = [
  {
    id: "cost-per-call",
    label: "Cost Per Call",
    value: "$0.082",
    trend: "6.1%",
    trendType: "arrow",
    subtext: "vs Apr 1 - 30",
    icon: Phone,
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    id: "ai-cost-user",
    label: "Ai Cost per user",
    value: "$2.14",
    trend: "4.8%",
    trendType: "arrow",
    subtext: "vs Apr 1 - 30",
    icon: Zap,
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    id: "gross-margin",
    label: "Gross Profit Margins",
    value: "74.6%",
    trend: "3.7% pts",
    trendType: "bullet",
    subtext: "vs Apr 1 - 30",
    icon: BarChart3,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "cac",
    label: "Customer Acquisition Cost (ACU)",
    value: "$38.87",
    trend: "5.3%",
    trendType: "arrow",
    subtext: "vs Apr 1 - 30",
    icon: UserPlus,
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    id: "cost-free-trial",
    label: "Cost Per Free Trial",
    value: "$6.12",
    trend: "8.9%",
    trendType: "arrow",
    subtext: "vs Apr 1 - 30",
    icon: Compass,
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    id: "arpu",
    label: "Average Revenue per User (ARPU)",
    value: "$126.02",
    trend: "6.2%",
    trendType: "bullet",
    subtext: "vs Apr 1 - 30",
    icon: User,
    iconBg: "bg-indigo-50 text-indigo-600",
  },
];

export const UnitEconomics = () => {
  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Section Header */}
      <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
        Unit Economics
      </h3>

      {/* 6-Column Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {unitEconomicsData.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-light-gray p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
            >
              {/* Top Row: Icon + Label */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider leading-tight">
                  {card.label}
                </span>
              </div>

              {/* Value */}
              <div className="my-2.5">
                <h4 className="text-xl sm:text-2xl font-bold text-dark-black/80 tracking-tight">
                  {card.value}
                </h4>
              </div>

              {/* Trend / Subtext */}
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-light-black">
                <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5 shrink-0">
                  {card.trendType === "arrow" ? (
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <span className="text-xs font-bold leading-none">•</span>
                  )}
                  {card.trend}
                </span>
                <span className="truncate text-medium-black">
                  {card.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnitEconomics;

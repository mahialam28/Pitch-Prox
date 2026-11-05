"use client";

import React from "react";
import {
  UserCheck,
  Filter,
  Star,
  Heart,
  RotateCcw,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

const statsData = [
  {
    id: "active-reps",
    title: "Active Sales Reps",
    value: "48",
    trend: "^ 4 vs last 30 days",
    trendPositive: true,
    icon: UserCheck,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "lead-to-sub",
    title: "Lead to Subscription",
    value: "28.6%",
    trend: "^ 3.8% vs last 30 days",
    trendPositive: true,
    icon: Filter,
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    id: "prompt-adherence",
    title: "Avg. Prompt Adherence",
    value: "87.4%",
    trend: "^ 5.6% vs last 30 days",
    trendPositive: true,
    icon: Star,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    id: "trust-gain",
    title: "Avg. Trust Gain",
    value: "+21.3",
    trend: "^ 2.7 vs last 30 days",
    trendPositive: true,
    icon: Heart,
    iconBg: "bg-orange-50 text-orange-500",
  },
  {
    id: "subs-closed",
    title: "Subscriptions Closed",
    value: "142",
    trend: "^ 18 vs last 30 days",
    trendPositive: true,
    icon: RotateCcw,
    iconBg: "bg-rose-50 text-rose-500",
  },
  {
    id: "revenue",
    title: "Revenue This Month",
    value: "$358,420",
    trend: "^ $52,630 vs last 30 days",
    trendPositive: true,
    icon: DollarSign,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
];

export default function SalesRepsStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 w-full">
      {statsData.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-3 hover:shadow-sm transition-all duration-200"
          >
            {/* Top row: Icon + Title */}
            <div className="flex items-center gap-2.5">
              <div
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-light-black/90 leading-tight">
                {stat.title}
              </span>
            </div>

            {/* Middle: Big Value */}
            <div className="mt-1">
              <span className="text-2xl sm:text-[28px] font-bold text-dark-black/85 tracking-tight font-secondary leading-none">
                {stat.value}
              </span>
            </div>

            {/* Bottom: Trend */}
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 pt-0.5">
              <span>{stat.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

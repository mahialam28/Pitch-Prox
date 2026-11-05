"use client";

import React from "react";
import {
  ClipboardList,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function IncidentStats({ stats }) {
  const defaultStats = [
    {
      id: "total",
      label: "Total Incidents",
      value: "38",
      trend: "12% vs last 30 days",
      trendDirection: "up",
      icon: ClipboardList,
      iconBg: "bg-[#E6F7F7]",
      iconColor: "text-[#0EADAB]",
    },
    {
      id: "open",
      label: "Active Incidents",
      value: "7",
      trend: "12% vs last 30 days",
      trendDirection: "up",
      icon: AlertCircle,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#EF4444]",
    },
    {
      id: "critical",
      label: "Critical / High",
      value: "2",
      trend: "12% vs last 30 days",
      trendDirection: "up",
      icon: ShieldAlert,
      iconBg: "bg-[#FEF3EB]",
      iconColor: "text-[#F97316]",
    },
    {
      id: "resolved",
      label: "Resolved This Month",
      value: "24",
      trend: "12% vs last 30 days",
      trendDirection: "up",
      icon: CheckCircle2,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
    {
      id: "resolution_time",
      label: "Avg. Resolution Time",
      value: "18h 42m",
      trend: "22% vs last 30 days",
      trendDirection: "down",
      icon: Clock,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#3B82F6]",
    },
  ];

  const statItems = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 w-full">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        const isUp = item.trendDirection === "up";

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-sm group"
          >
            {/* Top Row: Label & Icon */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-medium-black">
                {item.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
              >
                <IconComponent className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
            </div>

            {/* Metric Value & Trend */}
            <div className="mt-3 space-y-2">
              <span className="text-2xl sm:text-3xl font-bold text-dark-black tracking-tight font-secondary leading-none block">
                {item.value}
              </span>

              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                {isUp ? (
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>
                  {isUp ? "↑" : "↓"} {item.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

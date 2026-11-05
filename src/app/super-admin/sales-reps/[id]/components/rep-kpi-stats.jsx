"use client";

import React from "react";
import { PhoneCall, Zap, Filter, Heart, ArrowUpRight } from "lucide-react";

export default function RepKpiStats({ rep }) {
  const kpiData = [
    {
      id: "total-calls",
      label: "TOTAL CALLS",
      value: rep.totalCalls || "128",
      trend: "↑ 12 vs last 30 days",
      icon: PhoneCall,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "subs-closed",
      label: "SUBSCRIPTIONS CLOSED",
      value: rep.subscriptionsClosed || "56",
      trend: "↑ 8 vs last 30 days",
      icon: Zap,
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      id: "lead-to-sub",
      label: "LEAD TO SUBSCRIPTION",
      value: rep.leadToSub || "34.2%",
      trend: "↑ 6.1% vs last 30 days",
      icon: Filter,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "trust-gain",
      label: "AVG. TRUST GAIN",
      value: rep.trustGain || "+28.7",
      trend: "↑ 3.2 vs last 30 days",
      icon: Heart,
      iconBg: "bg-orange-50 text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="bg-white p-3.5 sm:p-4 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-2 hover:shadow-sm transition-all"
          >
            {/* Top row: Icon + Label */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg ${kpi.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                {kpi.label}
              </span>
            </div>

            {/* Value */}
            <div className="mt-0.5">
              <span className="text-2xl font-bold text-dark-black/90 tracking-tight font-secondary leading-none">
                {kpi.value}
              </span>
            </div>

            {/* Trend */}
            <div className="text-[10.5px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>{kpi.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

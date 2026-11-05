"use client";

import React from "react";
import {
  AlertTriangle,
  Coins,
  TrendingDown,
  Sparkles,
  BookOpen,
  Target,
} from "lucide-react";

export const operationalAlertsData = [
  {
    id: "alert-1",
    title: "AI Latency Elevated",
    description: "Average response time up 18%",
    timestamp: "Today, 9:41 AM",
    icon: AlertTriangle,
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    id: "alert-2",
    title: "Twilio Costs Increased",
    description: "Spend up 12% this week",
    timestamp: "Today, 8:15 AM",
    icon: Coins,
    iconBg: "bg-orange-50 text-orange-600",
  },
  {
    id: "alert-3",
    title: "Churn Spike Detected",
    description: "0.6 pts increase in last 7 days",
    timestamp: "Today, 7:32 AM",
    icon: TrendingDown,
    iconBg: "bg-rose-50 text-rose-600",
  },
  {
    id: "alert-4",
    title: "Enterprise Update Closed",
    description: "Horizon Realty upgraded to Enterprise plan",
    timestamp: "Yesterday, 4:05 PM",
    icon: Sparkles,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "alert-5",
    title: "Playbook Sales Up",
    description: "Revenue up 24% this month",
    timestamp: "Yesterday, 3:11 PM",
    icon: BookOpen,
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    id: "alert-6",
    title: "Trial Conversion Improved",
    description: "Up 2.3 pts vs last month",
    timestamp: "Yesterday, 2:02 PM",
    icon: Target,
    iconBg: "bg-sky-50 text-sky-600",
  },
];

export const Alerts = () => {
  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Alerts & Operational Monitoring
        </h3>
      </div>

      {/* 6 Alert Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {operationalAlertsData.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-light-gray p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
            >
              {/* Card Top: Icon */}
              <div>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Title & Description */}
                <div className="mt-2.5">
                  <h4 className="text-xs font-bold text-dark-black/80 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-medium-black leading-snug mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-3 pt-2 border-t border-light-gray/40">
                <span className="text-[10px] text-light-black font-medium block">
                  {item.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Alerts;

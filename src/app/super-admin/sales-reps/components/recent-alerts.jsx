"use client";

import React from "react";
import { AlertTriangle, Clock } from "lucide-react";

const alertsData = [
  {
    id: "alert-quota",
    title: "3 reps are at risk of missing quota",
    subtitle: "Needs immediate attention",
    icon: AlertTriangle,
    cardBg: "bg-rose-50/60 border-rose-100",
    iconBg: "bg-rose-100 text-rose-500",
  },
  {
    id: "alert-prompt",
    title: "2 reps have low prompt adherence",
    subtitle: "Coaching recommended",
    icon: Clock,
    cardBg: "bg-amber-50/60 border-amber-100",
    iconBg: "bg-amber-100 text-amber-500",
  },
];

export default function RecentAlerts() {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/85 tracking-tight">
          Recent Alerts
        </h3>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alertsData.map((alert) => {
          const IconComponent = alert.icon;
          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border ${alert.cardBg} flex items-start gap-3 transition-colors`}
            >
              <div
                className={`w-7 h-7 rounded-lg ${alert.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-dark-black/90 text-xs leading-snug">
                  {alert.title}
                </span>
                <span className="text-[11px] text-light-black font-normal mt-0.5">
                  {alert.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

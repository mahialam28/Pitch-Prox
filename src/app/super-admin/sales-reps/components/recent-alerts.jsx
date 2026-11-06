"use client";

import React from "react";
import { AlertTriangle, Clock, Info } from "lucide-react";

const TONES = {
  danger: { icon: AlertTriangle, cardBg: "bg-rose-50/60 border-rose-100", iconBg: "bg-rose-100 text-rose-500" },
  warning: { icon: Clock, cardBg: "bg-amber-50/60 border-amber-100", iconBg: "bg-amber-100 text-amber-500" },
  info: { icon: Info, cardBg: "bg-blue-50/60 border-blue-100", iconBg: "bg-blue-100 text-blue-500" },
};

export default function RecentAlerts({ alerts = [] }) {
  const alertsData = alerts.map((alert) => ({ ...alert, ...(TONES[alert.tone] ?? TONES.info) }));
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/85 tracking-tight">
          Recent Alerts
        </h3>
      </div>

      {/* Alerts List */}
      {!alertsData.length && <p className="text-xs text-light-black">No alerts. Everyone is on track.</p>}
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

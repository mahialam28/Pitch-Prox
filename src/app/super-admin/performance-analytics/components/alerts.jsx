"use client";

import React from "react";
import {
  AlertTriangle,
  TrendingDown,
  Sparkles,
} from "lucide-react";

const TONES = {
  danger: { icon: TrendingDown, iconBg: "bg-red-50 text-red" },
  warning: { icon: AlertTriangle, iconBg: "bg-amber-50 text-amber-600" },
  positive: { icon: Sparkles, iconBg: "bg-emerald-50 text-emerald-600" },
};

// Live alerts worked out from the same numbers as the rest of the page (lib/business-analytics).
// AI latency and telephony cost alerts come once calling and the AI provider are connected.
export const Alerts = ({ alerts = [], generatedAt }) => {
  const operationalAlertsData = alerts.map((alert) => ({
    ...alert,
    description: alert.detail,
    timestamp: generatedAt ? `Checked ${new Date(generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "",
    ...(TONES[alert.tone] ?? TONES.warning),
  }));
  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Alerts & Operational Monitoring
        </h3>
      </div>

      {!operationalAlertsData.length && <p className="text-xs text-light-black">No alerts right now.</p>}
      {/* Alert Cards Grid */}
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

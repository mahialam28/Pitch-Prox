"use client";

import React from "react";
import {
  Triangle,
  Mail,
  Eye,
  Layers,
  AlertTriangle,
} from "lucide-react";

export default function CampaignMetrics() {
  const metrics = [
    {
      id: "active-journeys",
      label: "ACTIVE JOURNEYS",
      value: "12",
      subtext: "+2 this month",
      subtextColor: "text-emerald-600",
      icon: Triangle,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "emails-sent",
      label: "EMAILS SENT (30 DAYS)",
      value: "184,220",
      subtext: "98.1% delivered",
      subtextColor: "text-emerald-600",
      icon: Mail,
      iconBg: "bg-sky-50 text-sky-600",
    },
    {
      id: "open-rate",
      label: "OPEN RATE",
      value: "48.2%",
      subtext: "+6.4% vs last 30 days",
      subtextColor: "text-emerald-600",
      icon: Eye,
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      id: "trial-conversion",
      label: "TRIAL → PAID CONV.",
      value: "24.6%",
      subtext: "+5.3% vs last 30 days",
      subtextColor: "text-emerald-600",
      icon: Layers,
      iconBg: "bg-orange-50 text-orange-500",
    },
    {
      id: "failed-automations",
      label: "FAILED AUTOMATIONS",
      value: "3",
      subtext: "Require attention",
      subtextColor: "text-red",
      icon: AlertTriangle,
      iconBg: "bg-red/10 text-red",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {metrics.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between"
          >
            {/* Top Row: Label and Icon */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-dark-black/85 tracking-tight font-secondary mt-1">
                  {item.value}
                </span>
              </div>

              <div
                className={`h-9 w-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <IconComponent className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>

            {/* Bottom Row: Subtext / Indicator */}
            <div className="mt-2.5">
              <span className={`text-[11px] font-semibold ${item.subtextColor}`}>
                {item.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

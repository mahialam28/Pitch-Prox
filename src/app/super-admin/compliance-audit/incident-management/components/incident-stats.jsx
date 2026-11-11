"use client";

import React from "react";
import { ClipboardList, AlertCircle, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

// stats: /api/v1/compliance/incidents → stats (definitions from client items 133–135)
export function formatHours(hours) {
  if (hours == null) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  return `${Math.round(hours / 24)} days`;
}

export default function IncidentStats({ stats }) {
  const values = {
    total: stats ? stats.total : "—",
    active: stats ? stats.active : "—",
    criticalHigh: stats ? stats.criticalHigh : "—",
    resolved: stats ? stats.resolvedThisMonth : "—",
    avg: formatHours(stats?.avgResolutionHours),
  };
  const notes = {
    total: "All time",
    active: "Open + Investigating",
    criticalHigh: "Active, Critical or High",
    resolved: "Resolved or closed",
    avg: "Reported to resolved",
  };
  const defaultStats = [
    { id: "total", label: "Total Incidents", value: values.total, note: notes.total, icon: ClipboardList, iconBg: "bg-[#E6F7F7]", iconColor: "text-[#0EADAB]" },
    { id: "active", label: "Active Incidents", value: values.active, note: notes.active, icon: AlertCircle, iconBg: "bg-[#FEE2E2]", iconColor: "text-[#EF4444]" },
    { id: "criticalHigh", label: "Critical / High", value: values.criticalHigh, note: notes.criticalHigh, icon: ShieldAlert, iconBg: "bg-[#FEF3EB]", iconColor: "text-[#F97316]" },
    { id: "resolved", label: "Resolved This Month", value: values.resolved, note: notes.resolved, icon: CheckCircle2, iconBg: "bg-[#ECFDF5]", iconColor: "text-[#10B981]" },
    { id: "avg", label: "Avg. Resolution Time", value: values.avg, note: notes.avg, icon: Clock, iconBg: "bg-[#EFF6FF]", iconColor: "text-[#3B82F6]" },
  ];

  const statItems = defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 w-full">
      {statItems.map((item) => {
        const IconComponent = item.icon;

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

              <div className="text-[11px] font-medium text-light-black">{item.note}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

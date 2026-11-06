"use client";

import React from "react";
import { Play, Pause, Edit3, AlertCircle } from "lucide-react";

const HEALTH = [
  { id: "active", label: "Live", icon: Play, iconColor: "bg-emerald-50 text-emerald-600", barColor: "bg-emerald-500" },
  { id: "paused", label: "Paused", icon: Pause, iconColor: "bg-amber-50 text-amber-600", barColor: "bg-amber-500" },
  { id: "draft", label: "Draft", icon: Edit3, iconColor: "bg-slate-100 text-slate-600", barColor: "bg-slate-400" },
];

// Live: journeys by status, and journeys whose email steps point at templates that aren't Active
export default function JourneyHealthSection({ journeys = [], templates = [] }) {
  const total = journeys.length || 1;
  const active = new Set(templates.filter((template) => template.status === "Active").map((template) => template.id));
  const broken = journeys.filter((journey) => journey.status === "active" && JSON.stringify(journey.steps).match(/"templateId":"([^"]+)"/g)?.some((match) => !active.has(match.split('"')[3]))).length;
  const HEALTH_ITEMS = [
    ...HEALTH.map((item) => ({ ...item, count: journeys.filter((journey) => journey.status === item.id).length })),
    { id: "issues", label: "Issues", icon: AlertCircle, iconColor: "bg-red/10 text-red", barColor: "bg-red", count: broken },
  ].map((item) => ({ ...item, percentage: Math.round((item.count / total) * 100) }));
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Journey Health
        </h3>
      </div>

      {broken > 0 && <p className="text-[11px] text-red mb-3">{broken} live journey{broken === 1 ? " sends" : "s send"} a template that isn&apos;t Active; those emails are skipped.</p>}
      {/* Status List */}
      <div className="space-y-4">
        {HEALTH_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 text-xs">
              {/* Status Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.iconColor}`}
              >
                <IconComponent className="w-3 h-3" />
              </div>

              {/* Status Label */}
              <span className="w-16 font-medium text-dark-black/80 text-xs">
                {item.label}
              </span>

              {/* Status Count */}
              <span className="w-6 font-bold text-dark-black/80 font-secondary text-xs">
                {item.count}
              </span>

              {/* Horizontal Progress Bar */}
              <div className="flex-1 bg-light-gray rounded-full h-2 overflow-hidden ml-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Lock, UserX, CreditCard, ShieldAlert, FileWarning, ServerCrash, HelpCircle } from "lucide-react";

// top: [{ category, count }] most frequent first; total = all incidents
const ICONS = { "Security Incident": [Lock, "text-purple-600", "bg-purple-500"], "Unauthorized Access": [UserX, "text-orange-500", "bg-orange-500"], "Payment / Billing Abuse": [CreditCard, "text-emerald-500", "bg-emerald-500"], "Data Privacy / Exposure": [ShieldAlert, "text-blue-500", "bg-blue-500"], "Compliance / Policy Violation": [FileWarning, "text-amber-500", "bg-amber-500"], "System / Service Outage": [ServerCrash, "text-rose-500", "bg-rose-500"], Other: [HelpCircle, "text-gray-500", "bg-gray-400"] };

export default function IncidentsByCategory({ top, total = 0 }) {

  const categories = (top ?? []).map((item) => {
    const [icon, iconColor, barColor] = ICONS[item.category] ?? ICONS.Other;
    const percentage = `${total ? Math.round((item.count / total) * 100) : 0}%`;
    return { id: item.category, label: item.category, count: item.count, percentage, barWidth: percentage, icon, iconColor, barColor };
  });

  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-bold text-dark-black font-secondary">
          Top Incident Categories
        </h3>

        <span className="text-xs text-light-black">All time</span>
      </div>

      {/* Category Rows */}
      <div className="flex flex-col gap-3.5 mt-2">
        {top && categories.length === 0 && <p className="text-xs text-light-black">No incidents reported yet.</p>}
        {categories.map((cat) => {
          const IconComp = cat.icon;
          return (
            <div key={cat.id} className="flex items-center justify-between gap-3 text-xs">
              {/* Icon & Label */}
              <div className="flex items-center gap-2 w-36 sm:w-40 shrink-0">
                <IconComp className={`w-4 h-4 ${cat.iconColor} shrink-0`} />
                <span className="text-dark-black/85 font-medium truncate">
                  {cat.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 bg-light-gray/80 h-2 rounded-full overflow-hidden mx-1">
                <div
                  className={`h-full ${cat.barColor} rounded-full transition-all duration-500`}
                  style={{ width: cat.barWidth }}
                />
              </div>

              {/* Count & Percentage */}
              <div className="text-right text-xs shrink-0 w-14">
                <span className="font-semibold text-dark-black">{cat.count} </span>
                <span className="text-light-black text-[11px]">({cat.percentage})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

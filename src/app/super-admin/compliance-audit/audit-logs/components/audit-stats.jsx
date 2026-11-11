"use client";

import React from "react";
import { FileText, User, CreditCard, Shield, Settings, ClipboardCheck, Database, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Card look per category; numbers come from /api/v1/compliance/audit-logs → stats
const CARDS = [
  { id: "total", label: "Total Events", icon: FileText, iconBg: "bg-[#E6F7F7]", iconColor: "text-[#0EADAB]" },
  { id: "user-management", label: "User Management", icon: User, iconBg: "bg-[#F3E8FF]", iconColor: "text-[#9333EA]" },
  { id: "billing", label: "Billing & Payments", icon: CreditCard, iconBg: "bg-[#FEF3EB]", iconColor: "text-[#F97316]" },
  { id: "security", label: "Security Events", icon: Shield, iconBg: "bg-[#ECFDF5]", iconColor: "text-[#10B981]" },
  { id: "system", label: "System Changes", icon: Settings, iconBg: "bg-[#EFF6FF]", iconColor: "text-[#3B82F6]" },
  { id: "compliance", label: "Compliance Events", icon: ClipboardCheck, iconBg: "bg-[#FEF9C3]", iconColor: "text-[#CA8A04]" },
  { id: "data-changes", label: "Data Changes", icon: Database, iconBg: "bg-[#FCE7F3]", iconColor: "text-[#DB2777]" },
];

// "12 in the last 7 days · ↑ 20%" (compared with the 7 days before)
function Trend({ card }) {
  if (!card) return <span className="text-[11px] text-light-black">—</span>;
  const change = card.changePct;
  const Icon = change == null || change === 0 ? Minus : change > 0 ? TrendingUp : TrendingDown;
  const color = change == null || change === 0 ? "text-light-black" : change > 0 ? "text-emerald-600" : "text-rose-500";
  return (
    <div className={`flex items-center gap-1 text-[11px] font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
      <span>
        {card.last7Days.toLocaleString()} in last 7 days
        {change != null && change !== 0 && ` (${change > 0 ? "↑" : "↓"} ${Math.abs(change)}%)`}
      </span>
    </div>
  );
}

export default function AuditStats({ stats }) {
  const byId = { total: stats?.total, ...Object.fromEntries((stats?.categories ?? []).map((card) => [card.id, card])) };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 sm:gap-5 w-full">
      {CARDS.map((item) => {
        const IconComponent = item.icon;
        const card = byId[item.id];
        return (
          <div key={item.id} className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-sm group">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-medium-black">{item.label}</span>
              <div className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                <IconComponent className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <span className="text-2xl sm:text-3xl font-bold text-dark-black tracking-tight font-secondary leading-none block">
                {card ? card.total.toLocaleString() : "—"}
              </span>
              <Trend card={card} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

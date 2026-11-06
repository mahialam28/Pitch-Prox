"use client";

import React from "react";
import { PhoneCall, Zap, Filter, DollarSign } from "lucide-react";
import { dollars, pct, trend } from "../../team-api";

export default function RepKpiStats({ rep }) {
  const closed = trend(rep.closed, rep.closedPrev);
  const revenue = trend(rep.revenueCents, rep.revenuePrevCents, (cents) => dollars(cents));
  const kpiData = [
    { id: "total-calls", label: "TOTAL CALLS", value: "—", trend: { text: "Needs call data", positive: null }, icon: PhoneCall, iconBg: "bg-emerald-50 text-emerald-600" },
    { id: "subs-closed", label: "SUBSCRIPTIONS CLOSED", value: rep.closed, trend: closed, icon: Zap, iconBg: "bg-purple-50 text-purple-600" },
    { id: "revenue", label: "BOOKED REVENUE", value: dollars(rep.revenueCents), trend: revenue, icon: DollarSign, iconBg: "bg-blue-50 text-blue-600" },
    { id: "lead-to-sub", label: "LEAD TO SUBSCRIPTION", value: pct(rep.leadToSubscription), trend: { text: `${rep.accounts} accounts from ${rep.leads} leads`, positive: null }, icon: Filter, iconBg: "bg-orange-50 text-orange-500" },
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
            <div className={`text-[10.5px] font-semibold flex items-center gap-1 ${kpi.trend.positive === true ? "text-emerald-600" : kpi.trend.positive === false ? "text-rose-500" : "text-light-black"}`}>
              <span>{kpi.trend.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

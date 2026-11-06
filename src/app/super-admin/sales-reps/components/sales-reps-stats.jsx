"use client";

import React from "react";
import {
  UserCheck,
  Filter,
  Star,
  Heart,
  RotateCcw,
  DollarSign,
} from "lucide-react";

import { dollars, pct, trend } from "../team-api";

// Prompt adherence and trust gain come from call analysis (waits for calling)
const buildStats = (stats) => {
  const closed = trend(stats.subscriptionsClosed, stats.subscriptionsClosedPrev);
  const revenue = trend(stats.revenueCents, stats.revenuePrevCents, (cents) => dollars(cents));
  const reps = stats.activeRepsChange ? { text: `${stats.activeRepsChange > 0 ? "↑" : "↓"} ${Math.abs(stats.activeRepsChange)} vs 30 days ago`, positive: stats.activeRepsChange > 0 } : { text: "No change vs 30 days ago", positive: null };
  return [
    { id: "active-reps", title: "Active Sales Reps", value: String(stats.activeReps), trend: reps, icon: UserCheck, iconBg: "bg-emerald-50 text-emerald-600" },
    { id: "lead-to-sub", title: "Lead to Subscription", value: pct(stats.leadToSubscription), trend: { text: "All-time, accounts per lead", positive: null }, icon: Filter, iconBg: "bg-purple-50 text-purple-600" },
    { id: "prompt-adherence", title: "Avg. Prompt Adherence", value: "—", trend: { text: "Needs call data", positive: null }, icon: Star, iconBg: "bg-blue-50 text-blue-600" },
    { id: "trust-gain", title: "Avg. Trust Gain", value: "—", trend: { text: "Needs call data", positive: null }, icon: Heart, iconBg: "bg-orange-50 text-orange-500" },
    { id: "subs-closed", title: "Subscriptions Closed", value: String(stats.subscriptionsClosed), trend: closed, icon: RotateCcw, iconBg: "bg-rose-50 text-rose-500" },
    { id: "revenue", title: "Booked Revenue This Month", value: dollars(stats.revenueCents), trend: revenue, icon: DollarSign, iconBg: "bg-emerald-50 text-emerald-600" },
  ];
};

export default function SalesRepsStats({ stats }) {
  const statsData = stats ? buildStats(stats) : [];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 w-full">
      {statsData.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-3 hover:shadow-sm transition-all duration-200"
          >
            {/* Top row: Icon + Title */}
            <div className="flex items-center gap-2.5">
              <div
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-light-black/90 leading-tight">
                {stat.title}
              </span>
            </div>

            {/* Middle: Big Value */}
            <div className="mt-1">
              <span className="text-2xl sm:text-[28px] font-bold text-dark-black/85 tracking-tight font-secondary leading-none">
                {stat.value}
              </span>
            </div>

            {/* Bottom: Trend */}
            <div className={`flex items-center gap-1 text-[11px] font-medium pt-0.5 ${stat.trend.positive === true ? "text-emerald-600" : stat.trend.positive === false ? "text-rose-500" : "text-light-black"}`}>
              <span>{stat.trend.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

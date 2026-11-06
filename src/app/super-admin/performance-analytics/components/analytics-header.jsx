"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CircleDollarSign,
  TrendingUp,
  Users,
  FlaskConical,
  TrendingDown,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const money = (cents) => `$${Math.round(cents / 100).toLocaleString("en-US")}`;
const percent = (value) => (value == null ? "—" : `${value}%`);

// Sparkline from daily snapshots (flat until there are two days of history)
function sparkline(values) {
  if (values.length < 2) return { pathD: "M 0 30 L 200 30 L 200 48 L 0 48 Z", strokeD: "M 0 30 L 200 30" };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => [(index / (values.length - 1)) * 200, max === min ? 26 : 40 - ((value - min) / (max - min)) * 30]);
  const strokeD = points.map(([x, y], index) => `${index ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return { strokeD, pathD: `${strokeD} L 200 48 L 0 48 Z` };
}

// Trend against the snapshot from 30 days ago, when there is one
const versus = (now, before, { format, lowerIsBetter = false }) => {
  if (before == null) return { value: "", subtext: "History builds from today", isPositive: true, direction: null };
  const diff = now - before;
  return { value: format(Math.abs(diff)), subtext: "vs 30 days ago", isPositive: lowerIsBetter ? diff <= 0 : diff >= 0, direction: diff >= 0 ? "up" : "down" };
};

const buildCards = ({ kpis, history }) => [
  {
    id: "mrr",
    title: "Monthly Recurring Revenue (MRR)",
    tooltip: "Monthly value of active paid subscriptions (plan price × seats; annual plans counted per month). Collected revenue is shown once Stripe is connected.",
    value: money(kpis.mrrCents),
    trend: versus(kpis.mrrCents, kpis.mrrBeforeCents, { format: money }),
    icon: CircleDollarSign,
    iconBg: "bg-emerald-50 text-emerald-600",
    lineColor: "#10B981",
    gradientId: "sa-grad-mrr",
    ...sparkline(history.map((row) => row.mrrCents)),
  },
  {
    id: "growth",
    title: "Net Account Growth",
    tooltip: "New paying accounts minus cancellations requested in the last 30 days.",
    value: `${kpis.netAccountGrowth >= 0 ? "+" : ""}${kpis.netAccountGrowth}`,
    trend: { value: percent(kpis.netAccountGrowthPct), subtext: `${kpis.newPaying} new, ${kpis.canceled} cancelled (30 days)`, isPositive: kpis.netAccountGrowth >= 0, direction: kpis.netAccountGrowth >= 0 ? "up" : "down" },
    icon: TrendingUp,
    iconBg: "bg-indigo-50 text-indigo-600",
    lineColor: "#6366F1",
    gradientId: "sa-grad-growth",
    ...sparkline(history.map((row) => row.active)),
  },
  {
    id: "subscribers",
    title: "Active Subscribers",
    tooltip: "Accounts with an active paid subscription right now.",
    value: kpis.activeSubscribers.toLocaleString("en-US"),
    trend: versus(kpis.activeSubscribers, kpis.activeBefore, { format: (value) => String(value) }),
    icon: Users,
    iconBg: "bg-sky-50 text-sky-600",
    lineColor: "#3B82F6",
    gradientId: "sa-grad-subs",
    ...sparkline(history.map((row) => row.active)),
  },
  {
    id: "trial-conv",
    title: "Free Trial Conversion",
    tooltip: "Share of self sign-ups (who start on the free trial) that are now on a paid plan.",
    value: percent(kpis.trialConversion),
    trend: { value: "", subtext: `${kpis.trialing} on trial now`, isPositive: true, direction: null },
    icon: FlaskConical,
    iconBg: "bg-purple-50 text-purple-600",
    lineColor: "#8B5CF6",
    gradientId: "sa-grad-trial",
    ...sparkline(history.map((row) => row.trialing)),
  },
  {
    id: "churn",
    title: "Churn Rate",
    tooltip: "Paying accounts that asked to cancel in the last 30 days, as a share of paying accounts.",
    value: percent(kpis.churnRate),
    trend: kpis.churnBefore == null || kpis.churnRate == null || kpis.churnRate === kpis.churnBefore ? { value: "", subtext: "Last 30 days", isPositive: true, direction: null } : { value: `${Math.abs(kpis.churnRate - kpis.churnBefore).toFixed(1)} pts`, subtext: "vs the 30 days before", isPositive: kpis.churnRate <= kpis.churnBefore, direction: kpis.churnRate >= kpis.churnBefore ? "up" : "down" },
    icon: TrendingDown,
    iconBg: "bg-red-50 text-red",
    lineColor: "#FF4842",
    gradientId: "sa-grad-churn",
    ...sparkline([]),
  },
  {
    id: "revenue-churn",
    title: "Revenue Churn",
    tooltip: "Monthly value of subscriptions that asked to cancel in the last 30 days, as a share of MRR.",
    value: percent(kpis.revenueChurn),
    trend: { value: "", subtext: "Last 30 days", isPositive: true, direction: null },
    icon: TrendingDown,
    iconBg: "bg-red-50 text-red",
    lineColor: "#FF4842",
    gradientId: "sa-grad-churn-revenue",
    ...sparkline([]),
  },
];

export const AnalyticsHeader = ({ data }) => {
  const kpiCards = data ? buildCards(data) : [];
  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6">
      {/* Page Title & Subtitle */}
      <div className="w-full flex flex-col gap-1 min-w-0">
        <Title variant="small" className="!text-dark-black/80 font-bold tracking-tight">
          Performance
        </Title>
        <Text variant="small" className="text-medium-black font-normal">
          Financial, operational, and growth intelligence center{data ? ` · updated ${new Date(data.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : ""}
        </Text>
      </div>

      {/* 5 KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Card Content with Inner Padding */}
              <div className="p-4 sm:p-5 pb-0 sm:pb-0">
                {/* Header: Icon & Label */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider leading-tight">
                    {card.title}
                  </span>
                  {card.tooltip && (
                    <span title={card.tooltip} aria-label={`${card.title}: ${card.tooltip}`} className="ml-auto inline-flex items-center justify-center w-4 h-4 rounded-full bg-light-gray text-[10px] font-bold text-medium-black cursor-help shrink-0">
                      i
                    </span>
                  )}
                </div>

                {/* Card Value */}
                <div className="mt-3">
                  <h3 className="text-2xl sm:text-[26px] font-bold text-dark-black/85 tracking-tight leading-none">
                    {card.value}
                  </h3>
                </div>

                {/* Card Trend & Date */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                  <span
                    className={`font-semibold flex items-center gap-0.5 text-[11px] ${
                      card.trend.isPositive ? "text-emerald-600" : "text-red"
                    }`}
                  >
                    {card.trend.direction && <span>{card.trend.direction === "down" ? "▾" : "▴"}</span>}
                    <span>{card.trend.value}</span>
                  </span>
                  <span className="text-[10px] text-light-black font-medium truncate">
                    {card.trend.subtext}
                  </span>
                </div>
              </div>

              {/* Full-width Sparkline Chart Area Flush to Card Borders */}
              <div className="w-full h-12 sm:h-14 mt-2 relative overflow-hidden block">
                <svg
                  viewBox="0 0 200 48"
                  className="w-full h-full block"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id={card.gradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={card.lineColor}
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor={card.lineColor}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Filled Area */}
                  <path
                    d={card.pathD}
                    fill={`url(#${card.gradientId})`}
                  />

                  {/* Smooth Stroke Line */}
                  <path
                    d={card.strokeD}
                    fill="none"
                    stroke={card.lineColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsHeader;

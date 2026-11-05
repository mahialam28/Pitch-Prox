"use client";

import React, { useState } from "react";
import {
  Building2,
  ArrowUp,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const repEfficiencyInsightsData = [
  {
    id: "insight-1",
    title: "Retention-qualified accounts up 18%",
    description: "More long-term value being created",
    trend: "1.9%",
    trendDirection: "down",
    trendColor: "text-emerald-600",
    icon: Building2,
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    id: "insight-2",
    title: "Upgrade revenue outperforming subscriptions",
    description: "Expansion revenue up 32% this month",
    trend: "1.9%",
    trendDirection: "down",
    trendColor: "text-emerald-600",
    icon: ArrowUp,
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    id: "insight-3",
    title: "Top reps generate lower churn",
    description: "Churn rate from top 20% reps is 1.9%",
    trend: "1.9%",
    trendDirection: "down",
    trendColor: "text-emerald-600",
    icon: Users,
    iconBg: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "insight-4",
    title: "High trust gain correlates with upgrades",
    description: "Users with trust score > 80 upgrade 2.4x more",
    trend: "1.9%",
    trendDirection: "down",
    trendColor: "text-emerald-600",
    icon: ShieldCheck,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "insight-5",
    title: "Call follow-up velocity increased by 24%",
    description: "Average response time dropped to under 12 minutes",
    trend: "2.4%",
    trendDirection: "up",
    trendColor: "text-emerald-600",
    icon: Zap,
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    id: "insight-6",
    title: "Pipeline conversion momentum peaked this week",
    description: "Qualified leads converted at 42% across senior reps",
    trend: "4.1%",
    trendDirection: "up",
    trendColor: "text-emerald-600",
    icon: TrendingUp,
    iconBg: "bg-teal-50 text-teal-600",
  },
  {
    id: "insight-7",
    title: "Playbook adherence drove 3x deal size",
    description: "Reps utilizing objection playbooks closed larger tiers",
    trend: "3.5%",
    trendDirection: "up",
    trendColor: "text-emerald-600",
    icon: Sparkles,
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    id: "insight-8",
    title: "Enterprise upsell milestone reached",
    description: "8 enterprise expansions finalized in the current billing cycle",
    trend: "1.8%",
    trendDirection: "up",
    trendColor: "text-emerald-600",
    icon: Award,
    iconBg: "bg-rose-50 text-rose-600",
  },
];

const ITEMS_PER_PAGE = 4;

export const SalesInsights = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = repEfficiencyInsightsData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedInsights = repEfficiencyInsightsData.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Section */}
      <div className="flex flex-col min-w-0">
        {/* Header without View All button */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            Sales Rep Efficiency Insights
          </h3>
        </div>

        {/* Paginated Insights List */}
        <div className="w-full space-y-3">
          {paginatedInsights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3.5 p-3 sm:p-3.5 rounded-xl border border-light-gray/70 hover:border-slate-300 hover:bg-light-gray/20 transition-all duration-150 group"
              >
                {/* Left Icon & Copy */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${item.iconBg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="font-semibold text-dark-black/80 text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                    <span className="text-xs text-medium-black truncate mt-1">
                      {item.description}
                    </span>
                  </div>
                </div>

                {/* Right Trend Indicator */}
                <div
                  className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ${item.trendColor}`}
                >
                  <span className="text-[10px]">
                    {item.trendDirection === "down" ? "▾" : "▴"}
                  </span>
                  <span>{item.trend}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Table Pagination Bar ── */}
      <div className="pt-3 flex items-center justify-end gap-2 text-xs text-light-black mt-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-6 h-6 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                safePage === pageNum
                  ? "bg-primary text-white"
                  : "hover:bg-light-gray text-medium-black"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesInsights;


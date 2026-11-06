"use client";

import React, { useState } from "react";
import {
  Users,
  Zap,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Insights are written by the server from the team's own numbers (lib/business-analytics)
const TONES = {
  positive: { icon: TrendingUp, iconBg: "bg-emerald-50 text-emerald-600" },
  warning: { icon: Zap, iconBg: "bg-amber-50 text-amber-600" },
  neutral: { icon: Users, iconBg: "bg-sky-50 text-sky-600" },
};

const ITEMS_PER_PAGE = 4;

export const SalesInsights = ({ insights = [] }) => {
  const repEfficiencyInsightsData = insights.map((item) => ({ ...item, description: item.detail, ...(TONES[item.tone] ?? TONES.neutral) }));
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
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            Sales Rep Efficiency Insights
          </h3>
        </div>

        {/* Paginated Insights List */}
        <div className="w-full space-y-3">
          {!paginatedInsights.length && <p className="text-xs text-light-black">Insights appear as leads, accounts and quotas build up.</p>}
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
                    <span className="font-semibold text-dark-black/80 text-xs sm:text-sm group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                    <span className="text-xs text-medium-black mt-1">
                      {item.description}
                    </span>
                  </div>
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

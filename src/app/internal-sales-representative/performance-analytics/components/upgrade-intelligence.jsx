"use client";

import React, { useState } from "react";
import { Zap, Eye, Users, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

const upgradeProspects = [
  {
    id: "up-1",
    name: "Sarah Johnson",
    subtitle: "SJ Realty Group",
    currentPlan: "Pro",
    likelihood: 92,
    predictedUpgrade: "Premium",
    revenueOpportunity: "$1,240",
    badgeStyle: "bg-purple-50 text-purple-600 border border-purple-100",
  },
  {
    id: "up-2",
    name: "Horizon Realty",
    subtitle: "Team Account",
    currentPlan: "Premium",
    likelihood: 88,
    predictedUpgrade: "Enterprise",
    revenueOpportunity: "$4,800",
    badgeStyle: "bg-orange-50 text-orange-600 border border-orange-100",
  },
  {
    id: "up-3",
    name: "Tyler Jackson",
    subtitle: "Elevate Real Estate",
    currentPlan: "Starter",
    likelihood: 74,
    predictedUpgrade: "Pro",
    revenueOpportunity: "$620",
    badgeStyle: "bg-sky-50 text-sky-600 border border-sky-100",
  },
  {
    id: "up-4",
    name: "Michael Carter",
    subtitle: "MC Homes",
    currentPlan: "Pro",
    likelihood: 66,
    predictedUpgrade: "Premium",
    revenueOpportunity: "$1,050",
    badgeStyle: "bg-purple-50 text-purple-600 border border-purple-100",
  },
  {
    id: "up-5",
    name: "Vision Realty Partners",
    subtitle: "Team Account",
    currentPlan: "Premium",
    likelihood: 61,
    predictedUpgrade: "Enterprise",
    revenueOpportunity: "$3,600",
    badgeStyle: "bg-orange-50 text-orange-600 border border-orange-100",
  },
  {
    id: "up-6",
    name: "Apex Capital Group",
    subtitle: "Commercial Division",
    currentPlan: "Pro",
    likelihood: 59,
    predictedUpgrade: "Premium",
    revenueOpportunity: "$1,150",
    badgeStyle: "bg-purple-50 text-purple-600 border border-purple-100",
  },
  {
    id: "up-7",
    name: "Elena Rostova",
    subtitle: "Rostov Real Estate",
    currentPlan: "Starter",
    likelihood: 55,
    predictedUpgrade: "Pro",
    revenueOpportunity: "$580",
    badgeStyle: "bg-sky-50 text-sky-600 border border-sky-100",
  },
  {
    id: "up-8",
    name: "BlueSky Properties",
    subtitle: "Team Account",
    currentPlan: "Premium",
    likelihood: 52,
    predictedUpgrade: "Enterprise",
    revenueOpportunity: "$2,900",
    badgeStyle: "bg-orange-50 text-orange-600 border border-orange-100",
  },
  {
    id: "up-9",
    name: "David Kim",
    subtitle: "Pacific Estates",
    currentPlan: "Starter",
    likelihood: 48,
    predictedUpgrade: "Pro",
    revenueOpportunity: "$620",
    badgeStyle: "bg-sky-50 text-sky-600 border border-sky-100",
  },
  {
    id: "up-10",
    name: "Crestview Living",
    subtitle: "Residential Branch",
    currentPlan: "Pro",
    likelihood: 45,
    predictedUpgrade: "Premium",
    revenueOpportunity: "$1,350",
    badgeStyle: "bg-purple-50 text-purple-600 border border-purple-100",
  },
  {
    id: "up-11",
    name: "Summit Acquisitions",
    subtitle: "Enterprise Account",
    currentPlan: "Premium",
    likelihood: 42,
    predictedUpgrade: "Enterprise",
    revenueOpportunity: "$5,200",
    badgeStyle: "bg-orange-50 text-orange-600 border border-orange-100",
  },
  {
    id: "up-12",
    name: "Jessica Taylor",
    subtitle: "Taylor Horizon Group",
    currentPlan: "Starter",
    likelihood: 38,
    predictedUpgrade: "Pro",
    revenueOpportunity: "$620",
    badgeStyle: "bg-sky-50 text-sky-600 border border-sky-100",
  },
  {
    id: "up-13",
    name: "Marcus Sterling",
    subtitle: "Sterling Homes LLC",
    currentPlan: "Pro",
    likelihood: 35,
    predictedUpgrade: "Premium",
    revenueOpportunity: "$980",
    badgeStyle: "bg-purple-50 text-purple-600 border border-purple-100",
  },
  {
    id: "up-14",
    name: "Vanguard Realty",
    subtitle: "Team Account",
    currentPlan: "Premium",
    likelihood: 31,
    predictedUpgrade: "Enterprise",
    revenueOpportunity: "$3,400",
    badgeStyle: "bg-orange-50 text-orange-600 border border-orange-100",
  },
];

const aiInsights = [
  {
    id: "insight-1",
    text: "High report usage detected",
    icon: Zap,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "insight-2",
    text: "Near call limit consistently",
    icon: Eye,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    id: "insight-3",
    text: "Multiple active team members",
    icon: Users,
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    id: "insight-4",
    text: "Enterprise behavior patterns detected",
    icon: BarChart3,
    iconBg: "bg-purple-50 text-purple-600",
  },
];

const ITEMS_PER_PAGE = 5;

export const UpgradeIntelligence = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = upgradeProspects.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedProspects = upgradeProspects.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Section */}
      <div className="flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            Upgrade Intelligence
          </h3>
          <span className="text-xs font-semibold text-light-black">
            {totalItems} prospects
          </span>
        </div>

        {/* Table Container */}
        <div className="w-full overflow-x-auto pr-1">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead className="bg-white">
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                <th className="pb-3 pt-1 pr-4 font-semibold bg-white">ACCOUNT / USER</th>
                <th className="pb-3 pt-1 px-4 font-semibold text-center bg-white">CURRENT PLAN</th>
                <th className="pb-3 pt-1 px-4 font-semibold text-center bg-white">UPGRADE LIKELIHOOD</th>
                <th className="pb-3 pt-1 px-4 font-semibold text-center bg-white">PREDICTED UPGRADE</th>
                <th className="pb-3 pt-1 pl-4 font-semibold text-right bg-white">REVENUE OPPORTUNITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {paginatedProspects.map((prospect) => (
                <tr
                  key={prospect.id}
                  className="hover:bg-primary/5 transition-colors group"
                >
                  {/* Account / User */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Circle */}
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-600 font-semibold text-xs">
                        {prospect.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="font-semibold text-dark-black/80 text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                          {prospect.name}
                        </span>
                        <span className="text-[11px] text-light-black font-medium truncate mt-0.5">
                          {prospect.subtitle}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Current Plan */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs font-semibold text-medium-black">
                      {prospect.currentPlan}
                    </span>
                  </td>

                  {/* Upgrade Likelihood */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-dark-black/80 text-xs">
                        {prospect.likelihood}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${prospect.likelihood}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Predicted Upgrade Badge */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${prospect.badgeStyle}`}
                    >
                      {prospect.predictedUpgrade}
                    </span>
                  </td>

                  {/* Revenue Opportunity */}
                  <td className="py-3 pl-4 text-right">
                    <span className="font-bold text-dark-black/80 text-xs sm:text-sm">
                      {prospect.revenueOpportunity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Bottom Section: AI Insights */}
      <div className="mt-4 pt-3.5 border-t border-light-gray/60">
        <h4 className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider mb-2.5">
          AI INSIGHTS
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {aiInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className="bg-white border border-light-gray hover:border-slate-300 rounded-xl p-2.5 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all duration-150"
              >
                <div
                  className={`w-6 h-6 rounded-lg ${insight.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-dark-black/80 leading-snug">
                  {insight.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpgradeIntelligence;

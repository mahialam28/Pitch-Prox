"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

export const JOURNEYS_DATA = [
  {
    id: 1,
    name: "Trial Onboarding",
    description: "Welcome new users",
    trigger: "User signs up",
    emails: 5,
    activeUsers: "2,456",
    status: "ACTIVE",
    conversion: "32.4%",
  },
  {
    id: 2,
    name: "Calibration Not Completed",
    description: "Prompt user to calibrate",
    trigger: "No calibration in 24h",
    emails: 3,
    activeUsers: "1,234",
    status: "ACTIVE",
    conversion: "18.7%",
  },
  {
    id: 3,
    name: "Trial Expiring Soon",
    description: "7 days before trial ends",
    trigger: "Trial expires in 7 days",
    emails: 4,
    activeUsers: "987",
    status: "ACTIVE",
    conversion: "26.1%",
  },
  {
    id: 4,
    name: "Inactive User Recovery",
    description: "Win back inactive users",
    trigger: "No login in 7 days",
    emails: 4,
    activeUsers: "3,421",
    status: "ACTIVE",
    conversion: "12.3%",
  },
  {
    id: 5,
    name: "Usage Warning (80%)",
    description: "Notify on high usage",
    trigger: "Usage > 80%",
    emails: 2,
    activeUsers: "765",
    status: "ACTIVE",
    conversion: "9.8%",
  },
  {
    id: 6,
    name: "Usage Warning (80%)",
    description: "Notify on high usage",
    trigger: "Usage > 80%",
    emails: 2,
    activeUsers: "765",
    status: "ACTIVE",
    conversion: "9.8%",
  },
  {
    id: 7,
    name: "Usage Warning (80%)",
    description: "Notify on high usage",
    trigger: "Usage > 80%",
    emails: 2,
    activeUsers: "765",
    status: "ACTIVE",
    conversion: "9.8%",
  },
  {
    id: 8,
    name: "Feature Adoption Push",
    description: "Encourage key feature usage",
    trigger: "Feature not used in 5d",
    emails: 3,
    activeUsers: "1,120",
    status: "ACTIVE",
    conversion: "15.2%",
  },
  {
    id: 9,
    name: "Weekly Performance Digest",
    description: "Send weekly summary metrics",
    trigger: "Every Monday 9AM",
    emails: 1,
    activeUsers: "4,890",
    status: "ACTIVE",
    conversion: "41.6%",
  },
  {
    id: 10,
    name: "Annual Plan Upgrade Nudge",
    description: "Incentivize annual commitment",
    trigger: "Active 60 days on Monthly",
    emails: 2,
    activeUsers: "620",
    status: "ACTIVE",
    conversion: "28.5%",
  },
  {
    id: 11,
    name: "Post-Call Survey",
    description: "Collect user feedback",
    trigger: "First 10 calls completed",
    emails: 1,
    activeUsers: "1,450",
    status: "ACTIVE",
    conversion: "34.2%",
  },
  {
    id: 12,
    name: "Re-engagement Cadence",
    description: "Win back dormant accounts",
    trigger: "No activity 30 days",
    emails: 3,
    activeUsers: "840",
    status: "ACTIVE",
    conversion: "11.1%",
  },
];

export default function ActiveJourneysSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const totalItems = JOURNEYS_DATA.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = JOURNEYS_DATA.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            Active Journeys
          </h3>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3 text-left">JOURNEY NAME</th>
                <th className="pb-3 text-left px-3">TRIGGER</th>
                <th className="pb-3 text-center px-2">EMAILS</th>
                <th className="pb-3 text-center px-2">ACTIVE USERS</th>
                <th className="pb-3 text-center px-2">STATUS</th>
                <th className="pb-3 text-right">CONVERSION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {currentItems.map((journey) => (
                <tr
                  key={journey.id}
                  className="hover:bg-light-gray/30 transition-colors"
                >
                  {/* Journey Name & Subtitle */}
                  <td className="py-3.5 text-left">
                    <div className="flex flex-col">
                      <span className="font-semibold text-dark-black/80 text-xs leading-tight whitespace-nowrap">
                        {journey.name}
                      </span>
                      <span className="text-[11px] text-light-black font-normal mt-0.5 whitespace-nowrap">
                        {journey.description}
                      </span>
                    </div>
                  </td>

                  {/* Trigger */}
                  <td className="py-3.5 px-3 text-left">
                    <span className="text-xs text-medium-black font-normal whitespace-nowrap">
                      {journey.trigger}
                    </span>
                  </td>

                  {/* Emails Count */}
                  <td className="py-3.5 px-2 text-center font-bold text-dark-black/80 font-secondary text-xs whitespace-nowrap">
                    {journey.emails}
                  </td>

                  {/* Active Users */}
                  <td className="py-3.5 px-2 text-center font-semibold text-dark-black/80 text-xs whitespace-nowrap">
                    {journey.activeUsers}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-2 text-center">
                    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
                      {journey.status}
                    </span>
                  </td>

                  {/* Conversion Rate */}
                  <td className="py-3.5 text-right font-bold text-dark-black/80 font-secondary text-xs whitespace-nowrap">
                    {journey.conversion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="pt-4 mt-2 border-t border-light-gray flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-[11px] text-light-black font-normal">
          Showing {startIndex + 1} to {endIndex} of {totalItems} journeys
        </span>

        <div className="flex items-center gap-1.5">
          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-medium-black hover:text-dark-black hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page 1 */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === 1
                ? "bg-primary text-white shadow-2xs"
                : "border border-light-gray text-medium-black hover:text-dark-black hover:border-slate-300"
            }`}
          >
            1
          </button>

          {/* Page 2 */}
          {totalPages >= 2 && (
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 2
                  ? "bg-primary text-white shadow-2xs"
                  : "border border-light-gray text-medium-black hover:text-dark-black hover:border-slate-300"
              }`}
            >
              2
            </button>
          )}

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-medium-black hover:text-dark-black hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Page Size Select */}
          <div className="relative ml-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-light-gray text-[11px] font-medium text-medium-black bg-white hover:border-slate-300 transition-all cursor-pointer shadow-2xs">
              <span>10 / page</span>
              <ChevronDown className="w-3 h-3 text-light-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

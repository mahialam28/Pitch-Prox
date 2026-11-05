"use client";

import React, { useState } from "react";
import { SlidersHorizontal, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export const BROADCAST_HISTORY = [
  {
    id: 1,
    name: "Executive Q3 Follow-up",
    segment: "HIGH TIER",
    status: "SENT",
    dateSent: "Oct 14, 2023",
    totalRecipients: "1,240",
  },
  {
    id: 2,
    name: "Holiday Re-engagement",
    segment: "DORMANT USERS",
    status: "SCHEDULED",
    dateSent: "Nov 24, 2023",
    totalRecipients: "4,500",
  },
  {
    id: 3,
    name: "Holiday Re-engagement",
    segment: "DORMANT USERS",
    status: "SCHEDULED",
    dateSent: "Nov 24, 2023",
    totalRecipients: "4,500",
  },
  {
    id: 4,
    name: "Lead Gen: Tech Sector",
    segment: "NEW LEADS",
    status: "DRAFT",
    dateSent: "Not sent",
    totalRecipients: "850",
  },
  {
    id: 5,
    name: "Q4 Feature Announcement",
    segment: "ALL USERS",
    status: "SENT",
    dateSent: "Dec 02, 2023",
    totalRecipients: "12,480",
  },
  {
    id: 6,
    name: "Annual Plan Promotion",
    segment: "TRIAL USERS",
    status: "SCHEDULED",
    dateSent: "Dec 15, 2023",
    totalRecipients: "3,120",
  },
];

export default function CampaignHistorySection() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const totalCampaigns = 128;

  const currentItems = BROADCAST_HISTORY.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      <div>
        {/* Top Header with Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            Campaign History
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-light-gray rounded-xl text-xs font-semibold text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-light-black" />
              <span>Filter Status</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-light-gray rounded-xl text-xs font-semibold text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-light-black" />
              <span>Date Range</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3 text-left">CAMPAIGN NAME</th>
                <th className="pb-3 text-left px-3">STATUS</th>
                <th className="pb-3 text-left px-3">DATE SENT</th>
                <th className="pb-3 text-right">TOTAL RECIPIENTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {currentItems.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-light-gray/30 transition-colors"
                >
                  {/* Campaign Name & Segment Subtitle */}
                  <td className="py-3.5 text-left">
                    <div className="flex flex-col">
                      <span className="font-semibold text-dark-black/80 text-xs leading-tight whitespace-nowrap">
                        {campaign.name}
                      </span>
                      <span className="text-[10px] text-light-black font-semibold uppercase tracking-wider mt-0.5 whitespace-nowrap">
                        SEGMENT: {campaign.segment}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 text-left">
                    {campaign.status === "SENT" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        SENT
                      </span>
                    )}
                    {campaign.status === "SCHEDULED" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-sky-50 text-sky-600 border border-sky-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        SCHEDULED
                      </span>
                    )}
                    {campaign.status === "DRAFT" && (
                      <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                        DRAFT
                      </span>
                    )}
                  </td>

                  {/* Date Sent */}
                  <td className="py-3.5 px-3 text-left whitespace-nowrap">
                    <span className="text-xs text-medium-black font-normal">
                      {campaign.dateSent}
                    </span>
                  </td>

                  {/* Total Recipients */}
                  <td className="py-3.5 text-right font-bold text-dark-black/80 font-secondary text-xs whitespace-nowrap">
                    {campaign.totalRecipients}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="pt-4 mt-2 border-t border-light-gray flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider">
          SHOWING {currentItems.length} OF {totalCampaigns} CAMPAIGNS
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

          {/* Page 3 */}
          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === 3
                ? "bg-primary text-white shadow-2xs"
                : "border border-light-gray text-medium-black hover:text-dark-black hover:border-slate-300"
            }`}
          >
            3
          </button>

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage === 3}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 3))}
            className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-medium-black hover:text-dark-black hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

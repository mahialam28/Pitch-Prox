"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { JOURNEYS_DATA } from "./active-journeys-section";

export default function AnalyticsJourneysTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalItems = JOURNEYS_DATA.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = JOURNEYS_DATA.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
            Active Journeys
          </h3>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse min-w-[580px]">
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
                  className="hover:bg-light-gray/25 transition-colors"
                >
                  {/* Journey Name & Subtitle */}
                  <td className="py-3.5 text-left">
                    <div className="flex flex-col">
                      <span className="font-semibold text-dark-black/85 text-xs leading-tight whitespace-nowrap">
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
                  <td className="py-3.5 px-2 text-center font-bold text-dark-black/85 font-secondary text-xs whitespace-nowrap">
                    {journey.emails}
                  </td>

                  {/* Active Users */}
                  <td className="py-3.5 px-2 text-center font-semibold text-dark-black/85 text-xs whitespace-nowrap">
                    {journey.activeUsers}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-2 text-center">
                    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
                      {journey.status}
                    </span>
                  </td>

                  {/* Conversion Rate */}
                  <td className="py-3.5 text-right font-bold text-dark-black/85 font-secondary text-xs whitespace-nowrap">
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

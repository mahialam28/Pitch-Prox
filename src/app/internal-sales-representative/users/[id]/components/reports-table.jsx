"use client";

import React from "react";
import { FileText } from "lucide-react";
import ReportsFilterBar from "./reports-filter-bar";
import Pagination from "@/components/shared/pagination/pagination";

export default function ReportsTable({
  reports = [],
  selectedReportId = "",
  onSelectReport = () => {},
  // Filter Props
  dateRange = "may1-may16",
  onDateRangeChange = () => {},
  reportType = "all",
  onReportTypeChange = () => {},
  leadType = "all",
  onLeadTypeChange = () => {},
  scoreFilter = "all",
  onScoreFilterChange = () => {},
  onClearFilters = () => {},
  // Pagination Props
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange = () => {},
  onPageSizeChange = () => {},
}) {
  const renderScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return <span className="text-light-black font-medium">—</span>;
    }
    let colorClasses = "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (score >= 90) {
      colorClasses = "bg-emerald-50 text-emerald-600 border-emerald-200";
    } else if (score >= 80) {
      colorClasses = "bg-emerald-50 text-emerald-600 border-emerald-200";
    } else if (score >= 70) {
      colorClasses = "bg-amber-50 text-amber-600 border-amber-200";
    } else {
      colorClasses = "bg-orange-50 text-orange-600 border-orange-200";
    }

    return (
      <span
        className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-lg border text-xs font-secondary ${colorClasses}`}
      >
        {score}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden flex flex-col w-full">
      {/* ── Filter Row Embedded Inside Table Section ── */}
      <ReportsFilterBar
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        reportType={reportType}
        onReportTypeChange={onReportTypeChange}
        leadType={leadType}
        onLeadTypeChange={onLeadTypeChange}
        scoreFilter={scoreFilter}
        onScoreFilterChange={onScoreFilterChange}
        onClearFilters={onClearFilters}
      />

      {/* ── Table Area ── */}
      <div className="w-full overflow-x-auto min-w-0 overscroll-x-contain touch-pan-x">
        <table className="w-full min-w-[650px] text-left text-xs border-collapse">
          <thead className="bg-light-gray/30 border-b border-light-gray/70 text-[10px] font-bold uppercase tracking-wider text-light-black select-none">
            <tr>
              <th className="py-3.5 px-4 sm:px-5">
                <span className="inline-flex items-center gap-1">
                  REPORT NAME <span className="text-light-black/50">↕</span>
                </span>
              </th>
              <th className="py-3.5 px-3">
                <span className="inline-flex items-center gap-1">
                  REPORT TYPE <span className="text-light-black/50">↕</span>
                </span>
              </th>
              <th className="py-3.5 px-3">
                <span className="inline-flex items-center gap-1">
                  LEAD TYPE <span className="text-light-black/50">↕</span>
                </span>
              </th>
              <th className="py-3.5 px-3 text-center">
                <span className="inline-flex items-center gap-1">
                  SCORE <span className="text-light-black/50">↕</span>
                </span>
              </th>
              <th className="py-3.5 px-3">
                <span className="inline-flex items-center gap-1">
                  CREATED DATE <span className="text-light-black/50">↕</span>
                </span>
              </th>
              <th className="py-3.5 px-4 sm:px-5">CREATED BY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60">
            {reports.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-xs text-light-black"
                >
                  No reports match the selected filters.
                </td>
              </tr>
            ) : (
              reports.map((item) => {
                const isSelected = item.id === selectedReportId;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectReport(item.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-teal-50/60 border-l-2 border-primary"
                        : "hover:bg-light-gray/20"
                    }`}
                  >
                    {/* Report Name */}
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl border shrink-0 ${item.iconColor}`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-dark-black/85">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-light-black font-normal mt-0.5">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Report Type */}
                    <td className="py-3.5 px-3 font-medium text-dark-black/80 whitespace-nowrap">
                      {item.reportType}
                    </td>

                    {/* Lead Type */}
                    <td className="py-3.5 px-3 text-light-black font-medium whitespace-nowrap">
                      {item.leadType}
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {renderScoreBadge(item.score)}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-dark-black/85">
                          {item.createdDate}
                        </span>
                        <span className="text-[10px] text-light-black font-normal">
                          {item.createdTime}
                        </span>
                      </div>
                    </td>

                    {/* Created By */}
                    <td className="py-3.5 px-4 sm:px-5 font-medium text-dark-black/80 whitespace-nowrap">
                      {item.createdBy}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          itemLabel="reports"
          pageSizeOptions={[
            { value: "10 / page", label: "10 / page" },
            { value: "15 / page", label: "15 / page" },
            { value: "20 / page", label: "20 / page" },
          ]}
        />
      )}
    </div>
  );
}

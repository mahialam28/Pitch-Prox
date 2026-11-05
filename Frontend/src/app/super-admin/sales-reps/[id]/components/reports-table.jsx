"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Eye,
  Download,
  Share2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

export const defaultReportsData = [
  {
    id: "REP-874512",
    name: "Call Analysis Report",
    type: "Call Analysis",
    leadType: "Small Teams",
    score: 92,
    created: "Jun 18, 2026",
    createdTime: "Jun 18, 2026 • 10:30 AM",
    generatedBy: "System",
    phone: "+1 (512) 555-0198",
    duration: "18:42",
    trustScore: "94 / 100",
    objectionsHandled: "7",
    keyObjections: "Commission, Timing",
    adherenceScore: "88%",
  },
  {
    id: "REP-874201",
    name: "Calibration Session Report",
    type: "Calibration",
    leadType: "—",
    score: 95,
    created: "Jun 17, 2026",
    createdTime: "Jun 17, 2026 • 2:15 PM",
    generatedBy: "Ryan Anderson",
    phone: "—",
    duration: "25:10",
    trustScore: "96 / 100",
    objectionsHandled: "9",
    keyObjections: "Value Prop, Competitors",
    adherenceScore: "94%",
  },
  {
    id: "REP-873990",
    name: "Playbook Adherence Report",
    type: "Adherence",
    leadType: "Solo agent",
    score: 89,
    created: "Jun 16, 2026",
    createdTime: "Jun 16, 2026 • 11:45 AM",
    generatedBy: "System",
    phone: "+1 (512) 555-0342",
    duration: "16:05",
    trustScore: "90 / 100",
    objectionsHandled: "5",
    keyObjections: "Price Point, Contract Terms",
    adherenceScore: "89%",
  },
  {
    id: "REP-873511",
    name: "Call Analysis Report",
    type: "Call Analysis",
    leadType: "Micro-Teams",
    score: 87,
    created: "Jun 15, 2026",
    createdTime: "Jun 15, 2026 • 4:20 PM",
    generatedBy: "System",
    phone: "+1 (512) 555-0819",
    duration: "14:20",
    trustScore: "88 / 100",
    objectionsHandled: "6",
    keyObjections: "Market Uncertainty",
    adherenceScore: "86%",
  },
  {
    id: "REP-872904",
    name: "Coaching Progress Report",
    type: "Coaching",
    leadType: "—",
    score: 84,
    created: "Jun 14, 2026",
    createdTime: "Jun 14, 2026 • 9:00 AM",
    generatedBy: "Daniel Martine",
    phone: "—",
    duration: "30:00",
    trustScore: "85 / 100",
    objectionsHandled: "4",
    keyObjections: "Tone, Objection Pivot",
    adherenceScore: "83%",
  },
  {
    id: "REP-872118",
    name: "Call Analysis Report",
    type: "Call Analysis",
    leadType: "Mid-Size Teams",
    score: 81,
    created: "Jun 12, 2026",
    createdTime: "Jun 12, 2026 • 3:10 PM",
    generatedBy: "System",
    phone: "+1 (512) 555-0677",
    duration: "12:15",
    trustScore: "82 / 100",
    objectionsHandled: "3",
    keyObjections: "Property Condition, Timeline",
    adherenceScore: "80%",
  },
];

export default function ReportsTable({
  reports = defaultReportsData,
  selectedReport,
  onSelectReport,
  onViewFullReport,
  onViewActivityLog,
  reportTypeFilter,
  leadTypeFilter,
  scoreFilter,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  // Filter reports according to header filters
  const filteredReports = reports.filter((item) => {
    if (
      reportTypeFilter &&
      reportTypeFilter !== "All report types" &&
      !item.type.toLowerCase().includes(reportTypeFilter.toLowerCase()) &&
      !item.name.toLowerCase().includes(reportTypeFilter.toLowerCase())
    ) {
      return false;
    }
    if (
      leadTypeFilter &&
      leadTypeFilter !== "All lead types" &&
      !item.leadType.toLowerCase().includes(leadTypeFilter.toLowerCase())
    ) {
      return false;
    }
    if (scoreFilter && scoreFilter !== "All scores") {
      if (scoreFilter === "90+" && item.score < 90) return false;
      if (scoreFilter === "85+" && item.score < 85) return false;
      if (scoreFilter === "80-84" && (item.score < 80 || item.score > 84)) return false;
      if (scoreFilter === "Below 80" && item.score >= 80) return false;
    }
    return true;
  });

  const handleDownloadPdf = (report, e) => {
    e.stopPropagation();
    setActiveActionMenuId(null);
    toast.success(`Downloading PDF for ${report.name} (${report.id})...`);
  };

  const handleShareReport = (report, e) => {
    e.stopPropagation();
    setActiveActionMenuId(null);
    navigator.clipboard?.writeText(window.location.href);
    toast.success(`Report link for ${report.id} copied to clipboard!`);
  };

  const handleDeleteReport = (report, e) => {
    e.stopPropagation();
    setActiveActionMenuId(null);
    toast.error(`Report ${report.id} removed from review history.`);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col justify-between overflow-hidden">
      {/* Table Header Row */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-base font-bold text-dark-black/90 font-secondary tracking-tight">
          Report History
        </h3>
        <span className="text-xs text-light-black">
          Showing {filteredReports.length} of 36 reports
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-light-gray text-[10.5px] font-bold text-light-black uppercase tracking-wider select-none">
              <th className="pb-3 text-left">REPORT NAME</th>
              <th className="pb-3 text-left">TYPE</th>
              <th className="pb-3 text-left">LEAD TYPE</th>
              <th className="pb-3 text-left">SCORE</th>
              <th className="pb-3 text-left">CREATED</th>
              <th className="pb-3 text-left">GENERATED BY</th>
              <th className="pb-3 text-right"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-light-gray/60 text-xs">
            {filteredReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              return (
                <tr
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-emerald-50/60 hover:bg-emerald-50/80"
                      : "hover:bg-light-gray/40"
                  }`}
                >
                  {/* Report Name */}
                  <td className="py-3.5 text-left whitespace-nowrap">
                    <span className="font-semibold text-dark-black/90 text-xs group-hover:text-primary transition-colors">
                      {report.name}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 text-left whitespace-nowrap text-light-black text-xs font-normal">
                    {report.type}
                  </td>

                  {/* Lead Type */}
                  <td className="py-3.5 text-left whitespace-nowrap text-light-black text-xs font-normal">
                    {report.leadType}
                  </td>

                  {/* Score */}
                  <td className="py-3.5 text-left whitespace-nowrap">
                    <span className="font-bold text-xs text-emerald-600">
                      {report.score}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 text-left whitespace-nowrap text-dark-black/85 text-xs font-medium">
                    {report.created}
                  </td>

                  {/* Generated By */}
                  <td className="py-3.5 text-left whitespace-nowrap text-light-black text-xs font-normal">
                    {report.generatedBy}
                  </td>

                  {/* Action 3-dots */}
                  <td className="py-3.5 text-right whitespace-nowrap relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveActionMenuId(
                          activeActionMenuId === report.id ? null : report.id
                        );
                      }}
                      className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Action Dropdown Menu */}
                    {activeActionMenuId === report.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-10 z-30 bg-white border border-light-gray rounded-xl shadow-xl py-1 w-40 animate-in fade-in zoom-in-95 duration-150 text-left"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveActionMenuId(null);
                            if (onViewFullReport) onViewFullReport(report);
                          }}
                          className="w-full px-3.5 py-2 text-xs text-dark-black/80 hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-light-black" />
                          <span>View Full Report</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadPdf(report, e)}
                          className="w-full px-3.5 py-2 text-xs text-dark-black/80 hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-light-black" />
                          <span>Download PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleShareReport(report, e)}
                          className="w-full px-3.5 py-2 text-xs text-dark-black/80 hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-light-black" />
                          <span>Share Link</span>
                        </button>
                        <div className="border-t border-light-gray my-1" />
                        <button
                          type="button"
                          onClick={(e) => handleDeleteReport(report, e)}
                          className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Report</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Under Table Retention Notice & Activity Log Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 text-xs">
        <span className="text-light-black">
          Reports are retained for audit and coaching review.
        </span>
        <button
          type="button"
          onClick={onViewActivityLog}
          className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View report activity log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-light-gray select-none">
        <span className="text-xs text-light-black">
          1-6 of 36 reports
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {[1, 2, 3].map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === pageNum
                  ? "bg-primary text-white shadow-xs"
                  : "border border-light-gray text-dark-black/75 hover:bg-light-gray"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === 3}
            onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
            className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

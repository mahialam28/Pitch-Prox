"use client";

import React from "react";
import toast from "react-hot-toast";

export default function ReportDetailCard({
  report,
  onViewFullReport,
}) {
  if (!report) return null;

  const handleDownloadPdf = () => {
    toast.success(`Preparing PDF download for ${report.name} (${report.id})...`);
  };

  const handleViewFullReport = () => {
    if (onViewFullReport) {
      onViewFullReport(report);
    } else {
      toast.success(`Opening full report for ${report.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col gap-6 w-full">
      {/* Top Header & Circular Score Ring */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary tracking-tight truncate">
            {report.name}
          </h3>
          <p className="text-xs text-light-black mt-0.5 truncate">
            {report.phone && report.phone !== "—"
              ? `${report.phone} • ${report.leadType}`
              : `${report.type} • ${report.generatedBy}`}
          </p>
        </div>

        {/* Circular Score Badge */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-50/40 flex items-center justify-center">
            <span className="text-base font-bold text-emerald-600">
              {report.score}
            </span>
          </div>
        </div>
      </div>

      {/* Meta Information Key-Values */}
      <div className="flex flex-col gap-2 text-xs py-1">
        <div className="flex items-center justify-between">
          <span className="text-light-black">Created</span>
          <span className="font-semibold text-dark-black/90">
            {report.createdTime || `${report.created} • 10:30 AM`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-light-black">Duration</span>
          <span className="font-semibold text-dark-black/90">
            {report.duration || "18:42"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-light-black">Report ID</span>
          <span className="font-semibold text-dark-black/90 tracking-wide">
            {report.id}
          </span>
        </div>
      </div>

      {/* SUMMARY Section */}
      <div className="flex flex-col gap-3 pt-2">
        <span className="text-[11px] font-bold text-light-black uppercase tracking-wider">
          SUMMARY
        </span>
        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-light-black">Trust Score</span>
            <span className="font-bold text-emerald-600">
              {report.trustScore || "94 / 100"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-light-black">Objections Handled</span>
            <span className="font-semibold text-dark-black/90">
              {report.objectionsHandled || "7"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-light-black">Key Objections</span>
            <span className="font-semibold text-dark-black/90 text-right truncate max-w-[180px]">
              {report.keyObjections || "Commission, Timing"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-light-black">Adherence Score</span>
            <span className="font-semibold text-dark-black/90">
              {report.adherenceScore || "88%"}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS Section */}
      <div className="flex flex-col gap-2.5 pt-2">
        <span className="text-[11px] font-bold text-light-black uppercase tracking-wider">
          QUICK ACTIONS
        </span>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="w-full py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/90 transition-colors cursor-pointer text-center"
        >
          Download PDF
        </button>

        <button
          type="button"
          onClick={handleViewFullReport}
          className="w-full py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/90 transition-colors cursor-pointer text-center"
        >
          Full Report
        </button>
      </div>
    </div>
  );
}

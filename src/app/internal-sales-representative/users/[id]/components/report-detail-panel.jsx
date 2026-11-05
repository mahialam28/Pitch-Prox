"use client";

import React from "react";
import {
  Eye,
  Download,
  Share2,
  Edit3,
  Trash2,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReportDetailPanel({
  report,
  onViewFullReport = () => {},
  onAdjustScore = () => {},
  onRemoveReport = () => {},
  onAddNote = () => {},
}) {
  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-6 flex flex-col items-center justify-center text-center text-light-black text-xs min-h-[350px]">
        Select a report from the table to view its details.
      </div>
    );
  }

  const handleCopyReportId = () => {
    if (report?.id) {
      navigator.clipboard.writeText(report.id);
      toast.success(`Copied ${report.id} to clipboard!`);
    }
  };

  const handleDownloadPdf = () => {
    toast.success(`Downloading PDF for ${report?.id} (${report?.title})...`);
  };

  const handleShareReport = () => {
    if (report?.id) {
      navigator.clipboard.writeText(`https://pitchprox.com/reports/${report.id}`);
      toast.success("Report link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-5 w-full">
      {/* ── 1. Top Header & Circular Score Meter ── */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-light-gray/70">
        <div className="flex flex-col min-w-0">
          <h3 className="text-base font-bold text-dark-black tracking-tight leading-snug">
            {report.title}
          </h3>
          <p className="text-xs text-light-black font-medium mt-0.5">
            {report.subtitle}
          </p>
        </div>

        {/* Circular Score Meter */}
        {report.score !== null && report.score !== undefined ? (
          <div className="flex flex-col items-center shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-50/50 text-emerald-600 flex flex-col items-center justify-center font-bold font-secondary text-base shadow-2xs">
              {report.score}
            </div>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1">
              {report.scoreRating || "HIGH SCORE"}
            </span>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-light-gray/50 border border-light-gray text-xs font-semibold text-light-black">
            NO SCORE
          </div>
        )}
      </div>

      {/* ── 2. Meta Info Strip ── */}
      <div className="space-y-2 text-xs">
        {report.leadType && report.leadType !== "—" && (
          <div className="flex items-center justify-between text-light-black">
            <span>Lead Type:</span>
            <span className="font-semibold text-dark-black/85">
              {report.leadType}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-light-black">
          <span>Date:</span>
          <span className="font-medium text-dark-black/85">
            {report.createdDate} • {report.createdTime}
          </span>
        </div>
        <div className="flex items-center justify-between text-light-black">
          <span>Duration:</span>
          <span className="font-medium text-dark-black/85 font-mono">
            {report.duration}
          </span>
        </div>
      </div>

      {/* ── 3. SUMMARY Section ── */}
      <div className="pt-2 border-t border-light-gray/70 flex flex-col gap-2.5">
        <span className="text-[10px] font-bold uppercase text-light-black tracking-wider">
          SUMMARY
        </span>
        <div className="divide-y divide-light-gray/60 text-xs">
          <div className="py-2 flex items-center justify-between">
            <span className="text-light-black">Trust Score</span>
            <span className="font-bold text-dark-black/85">
              {report.trustScore}
            </span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-light-black">Objections Handled</span>
            <span className="font-bold text-dark-black/85">
              {report.objectionsHandled}
            </span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-light-black">Key Objections</span>
            <span className="font-bold text-dark-black/85 text-right">
              {report.keyObjections}
            </span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-light-black">Adherence Score</span>
            <span className="font-bold text-dark-black/85">
              {report.adherenceScore}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3b. INTERNAL NOTES Section ── */}
      {report.internalNotes && report.internalNotes.length > 0 && (
        <div className="pt-2 border-t border-light-gray/70 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase text-light-black tracking-wider">
            INTERNAL NOTES ({report.internalNotes.length})
          </span>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {report.internalNotes.map((n, idx) => (
              <div
                key={n.id || idx}
                className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/80 text-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[10px] text-light-black">
                  <span className="font-bold text-purple-900">{n.author || "Internal Rep"}</span>
                  <span className="font-mono text-[9px]">{n.time}</span>
                </div>
                <p className="text-medium-black leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. QUICK ACTIONS Section ── */}
      <div className="pt-2 border-t border-light-gray/70 flex flex-col gap-2.5">
        <span className="text-[10px] font-bold uppercase text-light-black tracking-wider">
          QUICK ACTIONS
        </span>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onViewFullReport}
            className="w-full py-2 px-3.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-3.5 h-3.5 text-light-black" />
            <span>View Full Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-full py-2 px-3.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-light-black" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleShareReport}
            className="w-full py-2 px-3.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5 text-light-black" />
            <span>Share Report</span>
          </button>

          <button
            type="button"
            onClick={onAddNote}
            className="w-full py-2 px-3.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5 text-light-black" />
            <span>Add Internal Note</span>
          </button>
        </div>
      </div>

      {/* ── 5. ADMIN ACTIONS Section (No View Full Activity Log) ── */}
      <div className="pt-2 border-t border-light-gray/70 flex flex-col gap-2.5">
        <span className="text-[10px] font-bold uppercase text-light-black tracking-wider">
          ADMIN ACTIONS
        </span>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onRemoveReport}
            className="w-full py-2 px-3.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Remove Report</span>
          </button>

          <button
            type="button"
            onClick={onAdjustScore}
            className="w-full py-2 px-3.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5 text-light-black" />
            <span>Adjust Report Score</span>
          </button>
        </div>
      </div>

      {/* ── 6. Footer: Report ID with Copy Action ── */}
      <div className="pt-3 border-t border-light-gray/70 flex items-center justify-between text-[11px] text-light-black">
        <span className="font-mono font-medium">
          REPORT ID: {report.id}
        </span>
        <button
          type="button"
          onClick={handleCopyReportId}
          title="Copy Report ID"
          className="p-1 hover:text-dark-black rounded-md hover:bg-light-gray transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

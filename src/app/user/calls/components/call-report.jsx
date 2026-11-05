"use client";

import React, { useState } from "react";
import {
  Download,
  Printer,
  Share2,
  Upload,
  User,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import ShareReportModal from "./share-report-modal";

const CallReport = () => {
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <div className="w-full space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#0f172a] tracking-tight">
            Call Report
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            (No Transcript, No Lead Data Recorded)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#00a884] rounded-xl hover:bg-[#00a884]/90 transition-colors shadow-sm cursor-pointer">
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-[#334155] bg-white border border-gray-200 rounded-xl hover:bg-[#f8fafc] transition-colors cursor-pointer">
            <Printer className="h-4 w-4 text-[#64748b]" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-[#334155] bg-white border border-gray-200 rounded-xl hover:bg-[#f8fafc] transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4 text-[#64748b]" />
            <span>Share Report</span>
          </button>
        </div>
      </div>

      {/* Metadata Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Call ID */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f1f5f9] text-[#64748b]">
            <Upload className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider block">
              CALL ID
            </span>
            <span className="text-[13px] font-bold text-[#0f172a]">PX-48291</span>
          </div>
        </div>

        {/* Agent */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f1f5f9] text-[#64748b]">
            <User className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider block">
              AGENT
            </span>
            <span className="text-[13px] font-bold text-[#0f172a]">
              Bryce Lowe
            </span>
          </div>
        </div>

        {/* Lead Source */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f1f5f9] text-[#64748b]">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider block">
              LEAD SOURCE
            </span>
            <span className="text-[13px] font-bold text-[#0f172a]">
              Expired Listing
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f1f5f9] text-[#64748b]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider block">
              DATE
            </span>
            <span className="text-[13px] font-bold text-[#0f172a]">
              May 21, 2026
            </span>
          </div>
        </div>

        {/* Recording Length */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f1f5f9] text-[#64748b]">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider block">
              RECORDING LENGTH
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-bold text-[#0f172a]">7m 11s</span>
              <span className="text-[11px] text-[#94a3b8]">431 Seconds</span>
            </div>
          </div>
        </div>
      </div>

      <ShareReportModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
};

export default CallReport;

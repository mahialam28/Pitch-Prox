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
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import ShareReportModal from "@/app/user/calls/components/share-report-modal";

const CallReport = () => {
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <div className="w-full space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title variant="small" className="!text-dark-black/80 font-bold tracking-tight">
            Call Report
          </Title>
          <Text variant="small" className="text-light-black mt-1">
            (No Transcript, No Lead Data Recorded)
          </Text>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-primary rounded-xl hover:bg-medium-teal transition-colors shadow-xs cursor-pointer">
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray transition-colors cursor-pointer">
            <Printer className="h-4 w-4 text-medium-black" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4 text-medium-black" />
            <span>Share Report</span>
          </button>
        </div>
      </div>

      {/* Metadata Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Call ID */}
        <div className="bg-white rounded-2xl p-4 border border-light-gray shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-light-gray text-medium-black">
            <Upload className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
              CALL ID
            </span>
            <span className="text-[13px] font-bold text-dark-black/85">PX-48291</span>
          </div>
        </div>

        {/* Agent */}
        <div className="bg-white rounded-2xl p-4 border border-light-gray shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-light-gray text-medium-black">
            <User className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
              AGENT
            </span>
            <span className="text-[13px] font-bold text-dark-black/85">Sarah Jenkins</span>
          </div>
        </div>

        {/* Lead */}
        <div className="bg-white rounded-2xl p-4 border border-light-gray shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-light-gray text-medium-black">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
              LEAD
            </span>
            <span className="text-[13px] font-bold text-dark-black/85">
              Michael Chang (Acme Corp)
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl p-4 border border-light-gray shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-light-gray text-medium-black">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
              DATE
            </span>
            <span className="text-[13px] font-bold text-dark-black/85">May 20, 2024</span>
          </div>
        </div>

        {/* Time & Duration */}
        <div className="bg-white rounded-2xl p-4 border border-light-gray shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-light-gray text-medium-black">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-light-black uppercase tracking-wider block">
              RECORDING LENGTH
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-bold text-dark-black/85">7m 11s</span>
              <span className="text-[11px] text-light-black">431s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Design only: Share just closes the dialog */}
      <ShareReportModal isOpen={shareOpen} onClose={() => setShareOpen(false)} onShare={() => {}} />
    </div>
  );
};

export default CallReport;

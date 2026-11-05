"use client";

import React from "react";
import { X, Download, Share2, CheckCircle2, ShieldAlert, Sparkles, FileText, PhoneCall } from "lucide-react";
import toast from "react-hot-toast";

export default function FullReportModal({ isOpen, onClose, report }) {
  if (!isOpen || !report) return null;

  const handleDownload = () => {
    toast.success(`Downloading PDF for ${report.name} (${report.id})...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-light-gray shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-light-gray">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-dark-black/90 font-secondary tracking-tight">
                  {report.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {report.id}
                </span>
              </div>
              <p className="text-xs text-light-black mt-0.5">
                {report.createdTime || `${report.created} • 10:30 AM`} • Duration: {report.duration}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin]">
          {/* Top Score & Performance Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-light-gray/40 rounded-2xl p-3.5 border border-light-gray flex flex-col">
              <span className="text-[10.5px] font-bold text-light-black uppercase">Overall Score</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1">{report.score} / 100</span>
            </div>
            <div className="bg-light-gray/40 rounded-2xl p-3.5 border border-light-gray flex flex-col">
              <span className="text-[10.5px] font-bold text-light-black uppercase">Trust Score</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1">{report.trustScore}</span>
            </div>
            <div className="bg-light-gray/40 rounded-2xl p-3.5 border border-light-gray flex flex-col">
              <span className="text-[10.5px] font-bold text-light-black uppercase">Adherence</span>
              <span className="text-2xl font-bold text-dark-black/90 mt-1">{report.adherenceScore}</span>
            </div>
            <div className="bg-light-gray/40 rounded-2xl p-3.5 border border-light-gray flex flex-col">
              <span className="text-[10.5px] font-bold text-light-black uppercase">Objections</span>
              <span className="text-2xl font-bold text-dark-black/90 mt-1">{report.objectionsHandled} Handled</span>
            </div>
          </div>

          {/* Key Insights & Highlights */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Coaching Summary</span>
            </div>
            <p className="text-xs text-dark-black/80 leading-relaxed">
              The representative demonstrated strong rapport building during the opening phase, accurately identifying the seller&apos;s urgency. Objections concerning <strong className="text-dark-black">{report.keyObjections}</strong> were handled systematically with minimal friction.
            </p>
          </div>

          {/* Strengths & Actionable Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4 border border-light-gray bg-white flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strengths Highlighted</span>
              </div>
              <ul className="text-xs text-dark-black/75 space-y-1.5 list-disc list-inside">
                <li>Immediate value articulation upon initial objection</li>
                <li>Polite transition to pricing model breakdown</li>
                <li>Consistent adherence to approved talking points</li>
              </ul>
            </div>

            <div className="rounded-2xl p-4 border border-light-gray bg-white flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Opportunity Areas</span>
              </div>
              <ul className="text-xs text-dark-black/75 space-y-1.5 list-disc list-inside">
                <li>Follow up faster on contract timeframe concerns</li>
                <li>Avoid talking over the customer during pause periods</li>
                <li>Reinforce ROI metrics before requesting closing deposit</li>
              </ul>
            </div>
          </div>

          {/* Call Metadata Details */}
          <div className="border-t border-light-gray pt-4 flex flex-col gap-2 text-xs">
            <span className="text-[11px] font-bold text-light-black uppercase tracking-wider">
              Session Metadata
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-dark-black/80">
              <div><span className="text-light-black">Lead Category:</span> <span className="font-semibold">{report.leadType}</span></div>
              <div><span className="text-light-black">Contact:</span> <span className="font-semibold">{report.phone || "N/A"}</span></div>
              <div><span className="text-light-black">Generated By:</span> <span className="font-semibold">{report.generatedBy}</span></div>
              <div><span className="text-light-black">Session Duration:</span> <span className="font-semibold">{report.duration}</span></div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-light-gray flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/90 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-light-black" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

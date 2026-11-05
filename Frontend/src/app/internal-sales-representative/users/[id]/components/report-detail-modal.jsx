"use client";

import React from "react";
import {
  FileText,
  X,
  Sparkles,
  Download,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ReportDetailModal({
  isOpen = false,
  onClose = () => {},
  report = null,
  onDownloadPdf = () => {},
}) {
  if (!isOpen || !report) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark-black">
                  {report.title}
                </h3>
                <p className="text-xs text-light-black">
                  {report.id} • {report.subtitle} • {report.createdDate}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto text-xs">
            {/* Score & Key Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-light-gray/30 border border-light-gray">
              <div>
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-0.5">
                  Overall Score
                </span>
                <span className="text-base font-bold text-emerald-600 font-secondary">
                  {report.score !== null ? `${report.score}/100` : "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-0.5">
                  Trust Score
                </span>
                <span className="text-base font-bold text-dark-black font-secondary">
                  {report.trustScore}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-0.5">
                  Adherence
                </span>
                <span className="text-base font-bold text-dark-black font-secondary">
                  {report.adherenceScore}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-0.5">
                  Sentiment
                </span>
                <span className="text-xs font-bold text-dark-black">
                  {report.sentiment}
                </span>
              </div>
            </div>

            {/* AI Coaching Insights */}
            <div className="p-4 rounded-2xl border border-light-gray bg-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-dark-black">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI Coaching Notes & Breakdown</span>
              </div>
              <p className="text-medium-black leading-relaxed">
                {report.notes}
              </p>
              <div className="pt-2 border-t border-light-gray/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-light-black font-medium">Talk Ratio: </span>
                  <strong className="text-dark-black">{report.talkRatio}</strong>
                </div>
                <div>
                  <span className="text-light-black font-medium">Key Objections: </span>
                  <strong className="text-dark-black">{report.keyObjections}</strong>
                </div>
              </div>
            </div>

            {/* Transcription and Analysis (Replaces Audio Recording) */}
            <div className="p-4 rounded-2xl border border-light-gray bg-light-gray/15 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-dark-black">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>Call Transcription & Key Dialogue Analysis</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Privacy Compliant (No Audio Saved)</span>
                </div>
              </div>

              {/* Transcript Snippets */}
              <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-light-gray/80 text-xs">
                {/* Turn 1 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-primary border border-teal-100 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-light-black mb-0.5">
                      <span className="font-semibold text-dark-black">Agent (Jennifer)</span>
                      <span className="font-mono text-[10px]">00:14</span>
                    </div>
                    <p className="text-medium-black bg-light-gray/20 p-2.5 rounded-lg border border-light-gray/40">
                      &quot;Hi there, I noticed your home listing recently came off the market. Are you still planning to sell if the right offer is on the table?&quot;
                    </p>
                  </div>
                </div>

                {/* Turn 2 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-light-black mb-0.5">
                      <span className="font-semibold text-dark-black">Lead / Prospect</span>
                      <span className="font-mono text-[10px]">00:26</span>
                    </div>
                    <p className="text-medium-black bg-purple-50/30 p-2.5 rounded-lg border border-purple-100/50">
                      &quot;We had lots of showings with our previous broker but no solid buyers. We might hold off unless we can guarantee our target price.&quot;
                    </p>
                  </div>
                </div>

                {/* Turn 3 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-primary border border-teal-100 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-light-black mb-0.5">
                      <span className="font-semibold text-dark-black">Agent (Jennifer)</span>
                      <span className="font-mono text-[10px]">00:48</span>
                    </div>
                    <p className="text-medium-black bg-light-gray/20 p-2.5 rounded-lg border border-light-gray/40">
                      &quot;Completely understandable. We focus specifically on pre-qualified buyers actively seeking homes in your neighborhood. Would 10 minutes on Tuesday work to share our pricing data?&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Summary Callout */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-blue-950 flex flex-col gap-1 text-[11px]">
                <strong className="font-semibold flex items-center gap-1.5 text-blue-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transcription Analysis Verdict:</span>
                </strong>
                <span>
                  High empathy with effective objection framing. Agent successfully shifted focus from past frustrations to forward-looking value.
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:px-6 border-t border-light-gray bg-light-gray/20 flex items-center justify-between">
            <button
              type="button"
              onClick={onDownloadPdf}
              className="px-4 py-2 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

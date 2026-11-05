"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, FileText } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const reportTypeOptions = [
  { value: "Call Analysis Report", label: "Call Analysis Report" },
  { value: "Calibration Session Report", label: "Calibration Session Report" },
  { value: "Playbook Adherence Report", label: "Playbook Adherence Report" },
  { value: "Coaching Progress Report", label: "Coaching Progress Report" },
];

const callSelectionOptions = [
  {
    value: "CALL-101 (Jason Miller - Small Teams)",
    label: "CALL-101 (Jason Miller - Small Teams)",
  },
  {
    value: "CALL-102 (Mark Reynolds - Brokerage)",
    label: "CALL-102 (Mark Reynolds - Brokerage)",
  },
  {
    value: "CALL-105 (Amanda Clark - Solo agent)",
    label: "CALL-105 (Amanda Clark - Solo agent)",
  },
  {
    value: "CALL-106 (Chris Evans - Micro-Teams)",
    label: "CALL-106 (Chris Evans - Micro-Teams)",
  },
  {
    value: "CALL-109 (Michelle Lee - Mid-Size Teams)",
    label: "CALL-109 (Michelle Lee - Mid-Size Teams)",
  },
];

const formatOptions = [
  { value: "PDF & Web Summary", label: "PDF & Web Summary" },
  { value: "Detailed AI Audit", label: "Detailed AI Audit" },
  { value: "Executive One-Pager", label: "Executive One-Pager" },
];

export default function GenerateReportModal({
  isOpen,
  onClose,
  repName = "Ryan Anderson",
  onReportCreated,
}) {
  const [reportType, setReportType] = useState("Call Analysis Report");
  const [selectedCall, setSelectedCall] = useState(callSelectionOptions[0].value);
  const [format, setFormat] = useState("PDF & Web Summary");
  const [includeAiCoaching, setIncludeAiCoaching] = useState(true);
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const newReportId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
      const newScore = Math.floor(85 + Math.random() * 12);
      const leadMatch = selectedCall.includes("Small Teams")
        ? "Small Teams"
        : selectedCall.includes("Solo agent")
        ? "Solo agent"
        : selectedCall.includes("Micro-Teams")
        ? "Micro-Teams"
        : selectedCall.includes("Mid-Size")
        ? "Mid-Size Teams"
        : "Standard";

      const createdItem = {
        id: newReportId,
        name: reportType,
        type:
          reportType.includes("Calibration")
            ? "Calibration"
            : reportType.includes("Adherence")
            ? "Adherence"
            : reportType.includes("Coaching")
            ? "Coaching"
            : "Call Analysis",
        leadType: leadMatch,
        score: newScore,
        created: "Just now",
        createdTime: "Today • Just now",
        generatedBy: "System (Super Admin)",
        phone: "+1 (512) 555-0198",
        duration: "19:15",
        trustScore: `${newScore + 2} / 100`,
        objectionsHandled: "6",
        keyObjections: "Pricing, Timeline",
        adherenceScore: `${newScore - 3}%`,
      };

      if (onReportCreated) {
        onReportCreated(createdItem);
      }
      toast.success(`Report ${newReportId} generated successfully!`);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-light-gray shadow-2xl max-w-lg w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-light-gray">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-black/90 font-secondary tracking-tight">
                Generate Custom Report
              </h2>
              <p className="text-xs text-light-black mt-0.5">
                Generate instant AI analysis for {repName}.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 sm:p-8 space-y-5 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin]">
            {/* Field 1: Report Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-black/80">
                Report Type
              </label>
              <Dropdown
                items={reportTypeOptions}
                selected={reportType}
                onSelect={(val) => setReportType(val)}
                variant="default"
                placement="bottom"
                className="w-full"
              />
            </div>

            {/* Field 2: Target Call / Session */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-black/80">
                Select Call or Session
              </label>
              <Dropdown
                items={callSelectionOptions}
                selected={selectedCall}
                onSelect={(val) => setSelectedCall(val)}
                variant="default"
                placement="bottom"
                className="w-full"
              />
            </div>

            {/* Field 3: Report Output Format */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-black/80">
                Export Format
              </label>
              <Dropdown
                items={formatOptions}
                selected={format}
                onSelect={(val) => setFormat(val)}
                variant="default"
                placement="bottom"
                className="w-full"
              />
            </div>

            {/* Checkboxes / Options */}
            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAiCoaching}
                  onChange={(e) => setIncludeAiCoaching(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                />
                <span className="text-xs text-dark-black/85 font-medium">
                  Include AI Coaching Recommendations & Pitch Scoring
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTranscript}
                  onChange={(e) => setIncludeTranscript(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                />
                <span className="text-xs text-dark-black/85 font-medium">
                  Attach Timestamped Audio Transcript Highlights
                </span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 sm:px-8 py-4 border-t border-light-gray flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-dark-black/70 hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? "Analyzing & Generating..." : "Generate Report"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

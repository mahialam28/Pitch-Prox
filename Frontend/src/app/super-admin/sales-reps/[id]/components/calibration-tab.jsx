"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Check,
  UserX,
  Plus,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Mic,
  Activity,
  Volume2,
  Smile,
  Zap,
} from "lucide-react";
import AddManagerNoteModal from "./add-manager-note-modal";
import toast from "react-hot-toast";

const scoreBreakdown = [
  { label: "Word Choice", score: 80, icon: MessageSquare },
  { label: "Tone & Emphasis", score: 86, icon: Mic },
  { label: "Pacing", score: 84, icon: Activity },
  { label: "Pause/Filler", score: 83, icon: Volume2 },
  { label: "Sentiment", score: 82, icon: Smile },
  { label: "Energy/Inflection", score: 85, icon: Zap },
];

const roundData = [
  { round: "Round 1", score: "82%" },
  { round: "Round 2", score: "84%" },
  { round: "Round 3", score: "85%" },
  { round: "Round 4", score: "87%" },
  { round: "Round 5", score: "89%" },
  { round: "Round 6", score: "86%" },
  { round: "Round 7", score: "87%" },
];

const historyData = [
  {
    date: "May 16, 2025",
    score: "86/100",
    styleMatch: "92%",
    duration: "28m 14s",
    status: "Completed",
  },
  {
    date: "Apr 18, 2025",
    score: "82/100",
    styleMatch: "89%",
    duration: "26m 03s",
    status: "Completed",
  },
  {
    date: "Mar 20, 2025",
    score: "78/100",
    styleMatch: "85%",
    duration: "24m 41s",
    status: "Completed",
  },
];

export default function CalibrationTab({ rep }) {
  const repName = rep?.name || "Ryan Anderson";
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  // Circular gauge calculations
  const overallScore = 86;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const handleStartRecalibration = () => {
    setIsRecalibrating(true);
    toast.loading("Initiating live voice and pitch calibration test...", {
      id: "recalib",
    });
    setTimeout(() => {
      setIsRecalibrating(false);
      toast.success("Recalibration session started for " + repName, {
        id: "recalib",
      });
    }, 1200);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
      {/* ── Left Column (8 cols): Calibration Overview, Round Performance, History ── */}
      <div className="w-full lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-light-gray shadow-xs flex flex-col gap-7">
        {/* Section Header */}
        <div>
          <span className="text-xs font-bold text-dark-black/90 uppercase tracking-wider font-secondary">
            CALIBRATION OVERVIEW
          </span>
        </div>

        {/* Upper Row: Circular Gauge Card + 4 Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Gauge Card (5 cols) */}
          <div className="md:col-span-6 rounded-2xl p-5 border border-light-gray bg-white flex items-center justify-between gap-4">
            {/* SVG Circular Gauge */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-teal-600 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-light-black font-semibold">
                  Overall Score
                </span>
                <span className="text-xl font-bold text-dark-black/90 font-secondary leading-tight">
                  86%
                </span>
              </div>
            </div>

            {/* Status & Recalibration Button */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <h4 className="text-base font-bold text-dark-black/90 font-secondary">
                Excellent
              </h4>
              <p className="text-[11px] text-light-black">
                Last calibrated: May 16, 2025
              </p>
              <button
                type="button"
                onClick={handleStartRecalibration}
                disabled={isRecalibrating}
                className="mt-1 px-3 py-1.5 rounded-xl border border-light-gray hover:border-primary/50 hover:bg-light-gray text-[11px] font-bold text-primary transition-colors cursor-pointer flex items-center gap-1.5 w-fit"
              >
                <RotateCcw className="w-3 h-3" />
                <span>START RECALIBRATION</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Boxes (6 cols) */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3.5">
            <div className="rounded-2xl p-3.5 border border-light-gray bg-white flex flex-col justify-between">
              <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                NATURAL STYLE MATCH
              </span>
              <div className="mt-1">
                <h4 className="text-xl font-bold text-dark-black/90 font-secondary">
                  92%
                </h4>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Excellent
                </span>
              </div>
            </div>

            <div className="rounded-2xl p-3.5 border border-light-gray bg-white flex flex-col justify-between">
              <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                AI COACHING READINESS
              </span>
              <div className="mt-1">
                <h4 className="text-xl font-bold text-dark-black/90 font-secondary">
                  88%
                </h4>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Excellent
                </span>
              </div>
            </div>

            <div className="rounded-2xl p-3.5 border border-light-gray bg-white flex flex-col justify-between">
              <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                ROUNDS COMPLETED
              </span>
              <div className="mt-1">
                <h4 className="text-xl font-bold text-dark-black/90 font-secondary">
                  7 / 7
                </h4>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Complete
                </span>
              </div>
            </div>

            <div className="rounded-2xl p-3.5 border border-light-gray bg-white flex flex-col justify-between">
              <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                AVG. RESPONSE TIME
              </span>
              <div className="mt-1">
                <h4 className="text-xl font-bold text-dark-black/90 font-secondary">
                  8m 24s
                </h4>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Good
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Round Performance Stepper */}
        <div className="flex flex-col gap-3 pt-2">
          <span className="text-xs font-bold text-dark-black/90 uppercase tracking-wider font-secondary">
            ROUND PERFORMANCE
          </span>

          <div className="relative flex items-center justify-between pt-3 px-2 overflow-x-auto select-none [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Connecting line */}
            <div className="absolute top-[26px] left-6 right-6 h-0.5 bg-teal-600 -z-0" />

            {roundData.map((rd, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1.5 z-10 shrink-0 px-2"
              >
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-[10.5px] font-semibold text-dark-black/80">
                  {rd.round}
                </span>
                <span className="text-[11px] font-bold text-teal-600">
                  {rd.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Calibration History Table */}
        <div className="flex flex-col gap-3 pt-2">
          <span className="text-xs font-bold text-dark-black/90 tracking-tight">
            Calibration History
          </span>

          <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black">
                  <th className="pb-3 text-left">Date</th>
                  <th className="pb-3 text-left">Score</th>
                  <th className="pb-3 text-left">Style Match</th>
                  <th className="pb-3 text-left">Duration</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-gray/60 text-xs">
                {historyData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-light-gray/40 transition-colors">
                    <td className="py-3.5 text-left text-dark-black/85 font-medium">
                      {item.date}
                    </td>
                    <td className="py-3.5 text-left font-bold text-dark-black/90">
                      {item.score}
                    </td>
                    <td className="py-3.5 text-left text-dark-black/80 font-medium">
                      {item.styleMatch}
                    </td>
                    <td className="py-3.5 text-left text-light-black">
                      {item.duration}
                    </td>
                    <td className="py-3.5 text-left">
                      <span className="inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(`Viewing calibration report for ${item.date}`)
                        }
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info & Suspend Rep button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-light-gray">
          <p className="text-xs text-light-black">
            Joined: <strong>Jan 12, 2024</strong> • Time Zone:{" "}
            <strong>(GMT-05:00) Eastern Time (US & Canada)</strong>
          </p>

          <button
            type="button"
            onClick={() =>
              toast.error("Confirming rep suspension status...", {
                icon: "⚠️",
              })
            }
            className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 w-fit"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Suspend Rep</span>
          </button>
        </div>
      </div>

      {/* ── Right Column (4 cols): Score Breakdown, AI Insights, Manager Notes ── */}
      <div className="w-full lg:col-span-4 flex flex-col gap-6">
        {/* Card 1: Score Breakdown */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col gap-4">
          <span className="text-xs font-bold text-dark-black/90 uppercase tracking-wider font-secondary">
            SCORE BREAKDOWN
          </span>

          <div className="grid grid-cols-2 gap-3.5 pt-1">
            {scoreBreakdown.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-light-black">
                      <Icon className="w-3.5 h-3.5 text-teal-600" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-teal-600">
                      {item.score}%
                    </span>
                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: AI Calibration Insights */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col gap-4">
          <span className="text-xs font-bold text-dark-black/90 uppercase tracking-wider font-secondary">
            AI CALIBRATION INSIGHTS
          </span>

          <ul className="space-y-3 text-xs text-dark-black/80 leading-relaxed list-disc list-inside">
            <li>
              Your word choice is strong and aligns well with top performers.
            </li>
            <li>
              Slightly reduce filler word usage to improve overall clarity.
            </li>
            <li>
              Keep up your energy and inflection—your delivery is engaging.
            </li>
          </ul>

          <button
            type="button"
            onClick={() => toast.success("Opening complete AI audit log...")}
            className="w-full py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/90 transition-colors cursor-pointer text-center mt-1"
          >
            View Full Report
          </button>
        </div>

        {/* Card 3: Manager Notes (Private) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-dark-black/90 uppercase tracking-wider font-secondary">
              Manager Notes
            </h3>
            <span className="text-xs text-light-black font-normal">(Private)</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex flex-col justify-between gap-3">
            <p className="text-xs text-dark-black/85 leading-relaxed font-normal">
              &ldquo;Ryan is one of our top performers. Great emotional control and
              handles objections very well. Focus next month: More pre-expired
              leads.&rdquo;
            </p>
            <span className="text-[11px] text-light-black font-medium text-right self-end">
              — Sarah Johnson (May 15, 2025)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAddNoteOpen(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-light-gray hover:border-primary/50 hover:bg-light-gray/40 text-xs font-semibold text-dark-black/80 hover:text-primary transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manager Note</span>
          </button>
        </div>
      </div>

      {/* Add Manager Note Modal */}
      <AddManagerNoteModal
        isOpen={addNoteOpen}
        onClose={() => setAddNoteOpen(false)}
        repName={repName}
        onAdd={() => toast.success("Manager note recorded!")}
      />
    </div>
  );
}

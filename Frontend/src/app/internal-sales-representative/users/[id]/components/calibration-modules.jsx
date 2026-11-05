"use client";

import React from "react";
import {
  Sparkles,
  MessageSquare,
  Activity,
  Heart,
  TrendingUp,
  Eye,
  RotateCcw,
} from "lucide-react";

export const CALIBRATION_MODULES_DATA = [
  {
    id: "mod-1",
    name: "Core Pitch Flow",
    description: "Opening, value proposition, & close",
    score: 95,
    status: "Completed",
    completedDate: "Apr 22, 2025",
    completedTime: "10:15 AM",
    icon: Sparkles,
    iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    scoreBadge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    details: {
      clarity: "98%",
      pacing: "94%",
      hookStrength: "96%",
      feedback: "Strong opening hook with exceptional value proposition framing.",
    },
  },
  {
    id: "mod-2",
    name: "Objection Handling",
    description: "Responding to common objections",
    score: 88,
    status: "Completed",
    completedDate: "Apr 22, 2025",
    completedTime: "10:18 AM",
    icon: MessageSquare,
    iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    scoreBadge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    details: {
      empathyScore: "90%",
      rebuttalSpeed: "86%",
      objectionsDefused: "4 of 5",
      feedback: "Handled pricing objections smoothly. Keep answers under 20 seconds.",
    },
  },
  {
    id: "mod-3",
    name: "Tone & Pacing",
    description: "Voice tone, pacing, & confidence",
    score: 90,
    status: "Completed",
    completedDate: "Apr 22, 2025",
    completedTime: "10:22 AM",
    icon: Activity,
    iconBg: "bg-teal-50 text-teal-600 border-teal-100",
    scoreBadge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    details: {
      wordsPerMinute: "138 WPM (Optimal)",
      tonalModulation: "89%",
      fillerWordsCount: "0 detected",
      feedback: "Natural cadence with zero filler words during delivery.",
    },
  },
  {
    id: "mod-4",
    name: "Listening & Empathy",
    description: "Active listening & engagement",
    score: 91,
    status: "Completed",
    completedDate: "Apr 22, 2025",
    completedTime: "10:25 AM",
    icon: Heart,
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    scoreBadge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    details: {
      talkToListenRatio: "45% / 55%",
      interruptionCount: "0",
      empathySignals: "High",
      feedback: "Let the prospect speak fully without interruption. Excellent empathy.",
    },
  },
  {
    id: "mod-5",
    name: "Closing & Next Steps",
    description: "Commitment & next step execution",
    score: 85,
    status: "Completed",
    completedDate: "Apr 22, 2025",
    completedTime: "10:28 AM",
    icon: TrendingUp,
    iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    scoreBadge: "bg-amber-50 text-amber-600 border-amber-200",
    details: {
      ctaClarity: "88%",
      followUpSet: "Yes",
      urgencyIndex: "82%",
      feedback: "Solid close. Suggest asking directly for specific calendar time slots.",
    },
  },
];

export default function CalibrationModules({
  modules = CALIBRATION_MODULES_DATA,
  overallScore = 92,
  onSelectModule = () => {},
}) {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden flex flex-col w-full">
      {/* ── Card Header ── */}
      <div className="p-5 sm:p-6 pb-4 border-b border-light-gray/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-dark-black/85">
            Calibration Modules
          </h3>
          <span className="text-xs text-light-black font-normal">
            (Score by Module)
          </span>
          <RotateCcw className="w-3.5 h-3.5 text-light-black/60 ml-0.5" />
        </div>
      </div>

      {/* ── Scrollable Table Area ── */}
      <div className="w-full overflow-x-auto min-w-0 overscroll-x-contain touch-pan-x">
        <table className="w-full min-w-[620px] text-left text-xs border-collapse">
          <thead className="bg-light-gray/30 border-b border-light-gray/70 text-[10px] font-bold uppercase tracking-wider text-light-black select-none">
            <tr>
              <th className="py-3 px-4 sm:px-5">MODULE</th>
              <th className="py-3 px-3 text-center">SCORE</th>
              <th className="py-3 px-3">STATUS</th>
              <th className="py-3 px-3">COMPLETED ON</th>
              <th className="py-3 px-4 sm:px-5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <tr
                  key={mod.id}
                  className="hover:bg-light-gray/20 transition-colors"
                >
                  {/* Module Name & Description */}
                  <td className="py-3.5 px-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl border shrink-0 ${mod.iconBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-dark-black/85">
                          {mod.name}
                        </span>
                        <span className="text-[11px] text-light-black font-normal mt-0.5">
                          {mod.description}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-lg border text-xs font-secondary ${mod.scoreBadge}`}
                    >
                      {mod.score}/100
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-emerald-600 text-xs">
                      {mod.status}
                    </span>
                  </td>

                  {/* Completed On */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-dark-black/85">
                        {mod.completedDate}
                      </span>
                      <span className="text-[10px] text-light-black font-normal">
                        {mod.completedTime}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectModule(mod)}
                      className="px-3 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-light-black" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Overall Score Footer ── */}
      <div className="p-4 sm:px-6 border-t border-light-gray/70 bg-light-gray/10 flex items-center justify-between gap-3">
        <span className="text-xs sm:text-sm font-bold text-dark-black/85">
          Overall Score
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg sm:text-xl font-bold text-teal-600 font-secondary">
              {overallScore}
            </span>
            <span className="text-xs text-light-black font-normal">/100</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 uppercase">
            EXCELLENT
          </span>
        </div>
      </div>
    </div>
  );
}

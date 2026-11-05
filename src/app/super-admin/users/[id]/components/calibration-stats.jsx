"use client";

import React from "react";
import { FileText, TrendingUp, Calendar, CheckCircle2, RotateCcw } from "lucide-react";

export default function CalibrationStats({
  onResetCalibration = () => {},
  onStartEarly = () => {},
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full min-w-0">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* LEFT: Cards WITHOUT Buttons (Metrics & Progress)            */}
      {/* ─────────────────────────────────────────────────────────── */}

      {/* 1. Completion Score (No Button) */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[140px] gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-light-black/70 uppercase tracking-wider">
            Completion Score
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-dark-black font-secondary tracking-tight leading-none">
              92
            </span>
            <span className="text-xs text-light-black font-normal">/ 100</span>
          </div>
          <div className="w-full bg-light-gray/80 rounded-full h-1.5 overflow-hidden my-0.5">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: "92%" }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 leading-none">
              Excellent
            </span>
            <span className="text-[11px] text-light-black font-medium leading-none">
              Top 10%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Calibration Progress (No Button) */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[140px] gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-light-black/70 uppercase tracking-wider">
            Calibration Progress
          </span>
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-emerald-50/70 text-emerald-600 flex items-center justify-center font-bold font-secondary text-[10px] shrink-0">
            100%
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 font-secondary tracking-tight leading-none">
              100%
            </span>
            <span className="text-xs font-semibold text-emerald-600 ml-1">
              Completed
            </span>
          </div>
          <div className="w-full bg-light-gray/80 rounded-full h-1.5 overflow-hidden my-0.5">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
          <span className="text-xs text-light-black font-medium leading-none">
            5 of 5 modules completed
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* RIGHT: Cards WITH Buttons (Actions & Schedule)              */}
      {/* ─────────────────────────────────────────────────────────── */}

      {/* 3. Calibration Status (With Button) */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[140px] gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-light-black/70 uppercase tracking-wider">
            Calibration Status
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-base sm:text-lg font-bold text-emerald-600 tracking-tight leading-tight">
            Completed
          </span>
          <span className="text-xs text-light-black font-medium mt-0.5 leading-none">
            Last: Apr 22, 2025
          </span>
        </div>

        <button
          type="button"
          onClick={onResetCalibration}
          className="w-full py-1.5 px-3 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer text-center mt-auto"
        >
          Reset Calibration
        </button>
      </div>

      {/* 4. Next Calibration (With Button) */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[140px] gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-light-black/70 uppercase tracking-wider">
            Next Calibration
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-sm sm:text-base font-bold text-dark-black tracking-tight leading-tight">
            Jul 22, 2025
          </span>
          <span className="text-xs text-light-black font-medium mt-0.5 leading-none">
            In 91 days
          </span>
        </div>

        <button
          type="button"
          onClick={onStartEarly}
          className="w-full py-1.5 px-3 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer text-center mt-auto"
        >
          Start Early
        </button>
      </div>
    </div>
  );
}

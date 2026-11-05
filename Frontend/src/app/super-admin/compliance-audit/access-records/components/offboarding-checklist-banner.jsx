"use client";

import React from "react";
import { UserX, Clock, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

// counts: { inProgress, overdue, completed30 } from /api/v1/admin/offboarding
export default function OffboardingChecklistBanner({ onViewOffboarding, counts = {} }) {
  const handleClick = () => {
    if (onViewOffboarding) {
      onViewOffboarding();
    } else {
      toast.success("Opening offboarding workflow checklist...");
    }
  };

  return (
    <div className="w-full bg-white border border-light-gray/80 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all duration-200">
      {/* Left Info */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#E6F7F7] text-[#0EADAB] flex items-center justify-center shrink-0">
          <UserX className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-bold text-dark-black/90 font-secondary">
            Offboarding Checklist
          </h4>
          <p className="text-xs text-medium-black">
            Ensure all steps are completed when removing access for an employee.
          </p>
        </div>
      </div>

      {/* Right Counters & Action */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
        {/* Counter 1: In Progress */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-light-black tracking-wider uppercase">
              IN PROGRESS
            </span>
            <span className="text-sm font-bold text-dark-black leading-tight">
              {counts.inProgress ?? 0}
            </span>
          </div>
        </div>

        {/* Counter 2: Pending Review */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-light-black tracking-wider uppercase">
              OVERDUE
            </span>
            <span className="text-sm font-bold text-dark-black leading-tight">
              {counts.overdue ?? 0}
            </span>
          </div>
        </div>

        {/* Counter 3: Completed */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-light-black tracking-wider uppercase">
              COMPLETED (30 DAYS)
            </span>
            <span className="text-sm font-bold text-dark-black leading-tight">
              {counts.completed30 ?? 0}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleClick}
          className="px-4 py-2 bg-white border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          View Offboarding
        </button>
      </div>
    </div>
  );
}

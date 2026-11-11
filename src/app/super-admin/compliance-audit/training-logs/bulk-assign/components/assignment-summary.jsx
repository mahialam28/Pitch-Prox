"use client";

import React from "react";
import { Users, Calendar, Bell, CheckCircle2 } from "lucide-react";

// Assignments = Trainings × employees (3 Trainings for 10 employees = 30 assignments)
export default function AssignmentSummary({ employeeCount = 0, trainingCount = 0, dueDate, notificationsOn = true, onAssign, busy = false }) {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
        Assignment Summary
      </h3>

      {/* Summary Rows */}
      <div className="flex flex-col gap-3 text-xs">
        {/* Trainings */}
        <div className="flex items-center justify-between gap-2 text-medium-black">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Trainings:</span>
          </div>
          <span className="font-bold text-dark-black font-secondary">{trainingCount}</span>
        </div>

        {/* Employees */}
        <div className="flex items-center justify-between gap-2 text-medium-black">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span>Employees:</span>
          </div>
          <span className="font-bold text-dark-black font-secondary">
            {employeeCount}
          </span>
        </div>

        {/* Due Date */}
        <div className="flex items-center justify-between gap-2 text-medium-black">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Due:</span>
          </div>
          <span className="font-bold text-dark-black font-secondary">
            {dueDate ? new Date(`${dueDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not set"}
          </span>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between gap-2 text-medium-black">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-500" />
            <span>Notifications:</span>
          </div>
          <span className="font-bold text-dark-black font-secondary">
            {notificationsOn ? "On" : "Off"}
          </span>
        </div>
      </div>

      {/* Green notification banner */}
      <div className="p-3.5 rounded-xl bg-[#E8F8F0] border border-[#12B76A]/20 flex items-center gap-2.5 text-xs font-semibold text-[#12B76A]">
        <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.2]" />
        <span>{employeeCount * trainingCount} assignment{employeeCount * trainingCount === 1 ? "" : "s"} ({trainingCount} Training{trainingCount === 1 ? "" : "s"} × {employeeCount} employee{employeeCount === 1 ? "" : "s"}). Anyone who already has one open is skipped.</span>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onAssign}
        disabled={busy || !employeeCount || !trainingCount}
        className="disabled:opacity-50 disabled:cursor-not-allowed w-full py-2.5 rounded-xl bg-primary hover:bg-[#0ca09e] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs mt-1"
      >
        {busy ? "Assigning..." : "Assign Training"}
      </button>
    </div>
  );
}

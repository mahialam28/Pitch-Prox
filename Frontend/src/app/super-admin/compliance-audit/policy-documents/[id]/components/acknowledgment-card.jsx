"use client";

import React from "react";

export default function AcknowledgmentCard({ policy }) {
  const percentStr = policy?.acknowledgment || "98%";
  const percentNum = parseInt(percentStr) || 98;
  const acknowledged = policy?.acknowledgedCount || 196;
  const total = policy?.totalEmployees || 200;
  const pending = policy?.pendingCount || 4;
  const overdue = policy?.overdueCount || 0;

  return (
    <div className="bg-white rounded-3xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4 w-full">
      <h3 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary tracking-tight">
        Acknowledgment
      </h3>

      <div className="space-y-3 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-light-black font-medium">Progress</span>
            <span className="font-bold text-dark-black/90 font-secondary">
              {percentStr}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#E5E7EB]/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${percentNum}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-light-black">Acknowledged:</span>
            <span className="font-semibold text-dark-black/85">
              {acknowledged}/{total}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-light-black">Pending:</span>
            <span className="font-semibold text-amber-600">
              {pending}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-light-black">Overdue:</span>
            <span className="font-semibold text-rose-500">
              {overdue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

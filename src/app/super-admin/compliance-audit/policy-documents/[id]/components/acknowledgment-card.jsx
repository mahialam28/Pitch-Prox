"use client";

import React from "react";

// Signatures for the version in force (every active employee signs it)
export default function AcknowledgmentCard({ policy }) {
  const ack = policy.acknowledgment;
  return (
    <div className="bg-white rounded-3xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col space-y-4 w-full">
      <h3 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary tracking-tight">Acknowledgment</h3>
      {!ack ? (
        <p className="text-xs text-light-black">
          {!policy.requireAcknowledgment ? "Employees don't need to sign this policy." : policy.statusKey === "archived" ? "Archived: no longer signed." : "Employees are asked to sign once a Super Admin approves it."}
        </p>
      ) : (
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-light-black font-medium">Progress ({policy.version})</span>
              <span className="font-bold text-dark-black/90 font-secondary">{ack.rate == null ? "—" : `${ack.rate}%`}</span>
            </div>
            <div className="w-full bg-[#E5E7EB]/60 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={ack.rate ?? 0} aria-valuemin={0} aria-valuemax={100}>
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${ack.rate ?? 0}%` }} />
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-light-black">Acknowledged:</span>
              <span className="font-semibold text-dark-black/85">{ack.acknowledged}/{ack.total}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-light-black">Pending:</span>
              <span className="font-semibold text-amber-600">{ack.pending}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-light-black">Overdue (after {policy.ackDueDays} days):</span>
              <span className="font-semibold text-rose-500">{ack.overdue}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

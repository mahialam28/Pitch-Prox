"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import OverdueAcknowledgmentsModal from "./overdue-acknowledgments-modal";

// overdueCount: employees past the deadline for at least one policy
export default function PolicyAcknowledgmentBanner({ overdueCount, canRemind = false }) {
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E6F8F7] text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm sm:text-base font-bold text-dark-black/85 font-secondary">Policy Acknowledgment Required</h4>
            <p className="text-xs text-light-black">
              Employees review and acknowledge each new policy version from their portal. An acknowledgment becomes overdue 14 days after the version is approved.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOverdueModalOpen(true)}
          className="px-4 py-2.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black/80 hover:bg-light-gray/50 transition-colors whitespace-nowrap cursor-pointer"
        >
          View Overdue ({overdueCount ?? "…"})
        </button>
      </div>

      {isOverdueModalOpen && <OverdueAcknowledgmentsModal isOpen canRemind={canRemind} onClose={() => setIsOverdueModalOpen(false)} />}
    </>
  );
}

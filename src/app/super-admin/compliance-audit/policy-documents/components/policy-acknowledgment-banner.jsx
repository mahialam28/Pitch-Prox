"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import OverdueAcknowledgmentsModal from "./overdue-acknowledgments-modal";

export default function PolicyAcknowledgmentBanner() {
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        {/* Left Icon and Texts */}
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Teal shield icon */}
          <div className="w-10 h-10 rounded-xl bg-[#E6F8F7] text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>

          {/* Text Info */}
          <div className="space-y-0.5">
            <h4 className="text-sm sm:text-base font-bold text-dark-black/85 font-secondary">
              Policy Acknowledgment Required
            </h4>
            <p className="text-xs text-light-black">
              Employees are required to review and acknowledge updated policies. You will be notified of any overdue acknowledgments.
            </p>
          </div>
        </div>

        {/* Right Button */}
        <button
          onClick={() => setIsOverdueModalOpen(true)}
          className="border border-primary text-primary hover:bg-primary/10 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          View Overdue (3)
        </button>
      </div>

      {/* Overdue Modal */}
      <OverdueAcknowledgmentsModal
        isOpen={isOverdueModalOpen}
        onClose={() => setIsOverdueModalOpen(false)}
      />
    </>
  );
}

"use client";

import React, { useState } from "react";
import { Phone, FileText, CircleDollarSign, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import ApplyCreditAdjustmentModal from "./apply-credit-adjustment-modal";

export const CreditsAdjustments = () => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [creditStats, setCreditStats] = useState({
    callCredits: 1250,
    reportCredits: 780,
    accountCredits: 1480.0,
  });

  const handleCreditApplied = (newAdjustment) => {
    if (newAdjustment.type === "Call Credit") {
      const match = newAdjustment.value.match(/(\d+)/);
      const added = match ? parseInt(match[1]) : 100;
      setCreditStats((prev) => ({
        ...prev,
        callCredits: prev.callCredits + added,
      }));
    } else if (newAdjustment.type === "Report Credit") {
      const match = newAdjustment.value.match(/(\d+)/);
      const added = match ? parseInt(match[1]) : 5;
      setCreditStats((prev) => ({
        ...prev,
        reportCredits: prev.reportCredits + added,
      }));
    } else if (newAdjustment.type === "Dollar Credit") {
      const cleanVal = newAdjustment.value.replace(/[^0-9.]/g, "");
      const added = parseFloat(cleanVal) || 50.0;
      setCreditStats((prev) => ({
        ...prev,
        accountCredits: prev.accountCredits + added,
      }));
    }
  };

  return (
    <>
      <div className="w-full h-auto min-h-[540px] xl:h-[540px] bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-0">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-light-gray/60 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            4. Credits & Adjustments
          </h2>
        </div>

        {/* 3 Summary Sub-cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-auto py-2 sm:py-0">
          {/* Card 1: Call Credits */}
          <div className="bg-white border border-light-gray rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-sm hover:border-primary/40 transition-all duration-200 min-h-[140px] sm:min-h-[210px]">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-medium-black mt-3 leading-tight">
              Call Credits
            </span>
            <span className="text-lg sm:text-xl xl:text-2xl font-bold text-dark-black/80 tracking-tight mt-1 truncate max-w-full">
              {creditStats.callCredits.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-light-black mt-0.5">
              Total Available
            </span>
          </div>

          {/* Card 2: Report Credits */}
          <div className="bg-white border border-light-gray rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-sm hover:border-primary/40 transition-all duration-200 min-h-[140px] sm:min-h-[210px]">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-medium-black mt-3 leading-tight">
              Report Credits
            </span>
            <span className="text-lg sm:text-xl xl:text-2xl font-bold text-dark-black/80 tracking-tight mt-1 truncate max-w-full">
              {creditStats.reportCredits.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-light-black mt-0.5">
              Total Available
            </span>
          </div>

          {/* Card 3: Account Credits */}
          <div className="bg-white border border-light-gray rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-sm hover:border-primary/40 transition-all duration-200 min-h-[140px] sm:min-h-[210px]">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-medium-black mt-3 leading-tight">
              Account Credits
            </span>
            <span className="text-lg sm:text-xl xl:text-2xl font-bold text-dark-black/80 tracking-tight mt-1 truncate max-w-full">
              ${creditStats.accountCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-medium text-light-black mt-0.5">
              Total Credit
            </span>
          </div>
        </div>

        {/* Bottom Actions Area: Apply Credit Button + View All Adjustments Link */}
        <div className="pt-3 border-t border-light-gray/60 flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer text-center"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Credit / Adjustment</span>
          </button>

          <Link
            href="/super-admin/billing/credits-adjustments"
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-white hover:bg-light-gray text-dark-black/80 border border-light-gray text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer text-center"
          >
            <span>View All Adjustments</span>
            <ArrowRight className="w-4 h-4 text-light-black" />
          </Link>
        </div>
      </div>

      {/* Apply Credit / Adjustment Modal */}
      <ApplyCreditAdjustmentModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={handleCreditApplied}
      />
    </>
  );
};

export default CreditsAdjustments;

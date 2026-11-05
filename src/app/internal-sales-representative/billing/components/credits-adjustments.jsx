"use client";

import React from "react";
import { Phone, FileText, CircleDollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

export const CreditsAdjustments = () => {
  return (
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
            1,250
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
            780
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
            $1,480.00
          </span>
          <span className="text-[11px] font-medium text-light-black mt-0.5">
            Total Credit
          </span>
        </div>
      </div>

      {/* Bottom Link -> View All Adjustments */}
      <div className="pt-3 border-t border-light-gray/60 flex-shrink-0">
        <Link
          href="/internal-sales-representative/billing/credits-adjustments"
          className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-white hover:bg-light-gray text-dark-black/80 border border-light-gray text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer text-center"
        >
          <span>View All Adjustments</span>
          <ArrowRight className="w-4 h-4 text-light-black" />
        </Link>
      </div>
    </div>
  );
};

export default CreditsAdjustments;

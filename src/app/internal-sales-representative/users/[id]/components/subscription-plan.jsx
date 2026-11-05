"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const SubscriptionPlan = ({
  planName = "Premium Plan",
  status = "ACTIVE",
  price = "$499 / month",
  renewalDate = "Jun 15, 2025",
  onViewBillingDetails = () => {},
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* ── Header: Title ── */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight">
          Subscription Plan
        </h3>
      </div>

      {/* ── Plan Info Box ── */}
      <div className="flex items-start gap-3.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-dark-black text-sm">
              {planName}
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
              {status}
            </span>
          </div>
          <p className="text-xs text-light-black font-semibold">
            {price}
          </p>
          <p className="text-[11px] text-light-black">
            Renews on {renewalDate}
          </p>
        </div>
      </div>

      {/* ── Action Button: View Billing Details ── */}
      <button
        type="button"
        onClick={onViewBillingDetails}
        className="w-full py-2 px-3 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors cursor-pointer text-center shadow-2xs"
      >
        View Billing Details
      </button>
    </div>
  );
};

export default SubscriptionPlan;

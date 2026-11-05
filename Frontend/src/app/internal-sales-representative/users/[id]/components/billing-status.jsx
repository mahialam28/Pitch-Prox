"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const BillingStatus = ({
  status = "Up to date",
  statusSubtext = "No payments due",
  nextInvoice = "Jun 15, 2025",
  amount = "$499.00",
  onViewBillingHistory = () => {},
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* ── Header: Title ── */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight">
          Billing Status
        </h3>
      </div>

      {/* ── Status Banner & Invoicing Info ── */}
      <div className="space-y-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-bold text-dark-black text-sm leading-tight">
              {status}
            </h4>
            <p className="text-xs text-light-black mt-0.5">
              {statusSubtext}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-light-gray/60 flex-wrap gap-1">
          <span className="text-light-black">Next invoice: <strong className="font-medium text-dark-black/80">{nextInvoice}</strong></span>
          <span className="text-light-black">Amount: <strong className="font-bold text-dark-black/90 font-secondary">{amount}</strong></span>
        </div>
      </div>

      {/* ── Action Button: View Billing History ── */}
      <button
        type="button"
        onClick={onViewBillingHistory}
        className="w-full py-2 px-3 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors cursor-pointer text-center shadow-2xs"
      >
        View Billing History
      </button>
    </div>
  );
};

export default BillingStatus;

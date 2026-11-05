"use client";

import React from "react";
import toast from "react-hot-toast";

export default function AccountStatusCard({
  status = {
    accountStatus: "Active",
    billingStatus: "Up to date",
    plan: "Premium",
    nextInvoice: "Jun 15, 2025",
    autoRenew: true,
    accountId: "ACC-001234",
  },
  onViewSubscription = () => {},
  onToggleAutoRenew = () => {},
}) {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="pb-3 border-b border-light-gray/70">
        <h3 className="text-base font-bold text-dark-black/85">
          Account Status
        </h3>
      </div>

      {/* Status Details */}
      <div className="divide-y divide-light-gray/60 text-xs">
        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Status</span>
          <span className="font-semibold text-emerald-600">
            {status.accountStatus}
          </span>
        </div>

        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Billing Status</span>
          <span className="font-semibold text-emerald-600">
            {status.billingStatus}
          </span>
        </div>

        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Plan</span>
          <strong className="text-dark-black/85 font-bold">
            {status.plan}
          </strong>
        </div>

        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Next Invoice</span>
          <strong className="text-dark-black/85 font-bold">
            {status.nextInvoice}
          </strong>
        </div>

        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Auto Renew</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-light-gray text-dark-black">
              {status.autoRenew ? "ON" : "OFF"}
            </span>
            <button
              type="button"
              onClick={onToggleAutoRenew}
              className="text-xs font-semibold text-teal-600 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Account ID</span>
          <span className="font-mono font-bold text-dark-black/85">
            {status.accountId}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onViewSubscription}
          className="w-full py-2.5 px-4 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer text-center"
        >
          View Subscription & Billing
        </button>
      </div>
    </div>
  );
}

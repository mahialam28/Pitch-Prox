"use client";

import React from "react";
import { FileText, Pencil } from "lucide-react";

export const bundleOptions = [
  {
    id: "bundle-5",
    reports: "5 Reports",
    price: "$25",
    unitPrice: "$5 / report",
  },
  {
    id: "bundle-15",
    reports: "15 Reports",
    price: "$60",
    unitPrice: "$4 / report",
  },
  {
    id: "bundle-30",
    reports: "30 Reports",
    price: "$99",
    unitPrice: "$3.30 / report",
  },
  {
    id: "bundle-50",
    reports: "50 Reports",
    price: "$149",
    unitPrice: "$2.98 / report",
  },
];

// tiers: the saved bundles ({ reports, price, active }); without them the design's examples are shown
export const ReportAddOns = ({ onEditPlan, tiers = null }) => {
  const bundles = tiers
    ? tiers
        .filter((tier) => tier.active)
        .map((tier) => ({
          id: `bundle-${tier.id}`,
          reports: `${tier.reports} Reports`,
          price: `$${Number(tier.price).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
          unitPrice: `$${(Number(tier.price) / Number(tier.reports)).toFixed(2)} / report`,
        }))
    : bundleOptions;
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Header & Content */}
      <div className="flex flex-col">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-dark-black/80 font-secondary">
            Report Add-Ons
          </h3>
          <p className="text-xs text-medium-black mt-0.5">
            Add additional reports beyond plan limits.
          </p>
        </div>

        {/* Individual Item */}
        <div className="flex items-center gap-3.5 mt-5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-dark-black/80">
              Individual
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-dark-black/85 font-secondary">
                $5
              </span>
              <span className="text-xs text-medium-black">/ report</span>
            </div>
          </div>
        </div>

        {/* Bundles Section */}
        <div className="mt-6">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-dark-black/80">
              Bundles
            </span>
            <span className="text-[11px] text-light-black font-medium">
              (Stackable)
            </span>
          </div>
          <p className="text-[11px] text-light-black mt-0.5">
            Reports expire at end of billing cycle unless rollover is enabled.
          </p>

          {/* 4 Bundle Boxes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-white border border-light-gray rounded-xl p-2.5 sm:p-3 flex flex-col items-center text-center shadow-2xs hover:border-slate-300 transition-colors"
              >
                <span className="text-[10px] sm:text-[11px] font-medium text-medium-black truncate w-full">
                  {bundle.reports}
                </span>
                <span className="text-sm sm:text-base font-bold text-dark-black/85 font-secondary mt-1">
                  {bundle.price}
                </span>
                <span className="text-[9px] text-light-black font-medium mt-0.5 truncate w-full">
                  {bundle.unitPrice}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-6 pt-2">
        <button
          type="button"
          onClick={onEditPlan}
          className="w-full py-2.5 px-3 rounded-xl border border-light-gray hover:bg-light-gray/40 text-dark-black/80 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Plan</span>
        </button>
      </div>
    </div>
  );
};

export default ReportAddOns;

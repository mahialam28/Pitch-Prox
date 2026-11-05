"use client";

import React from "react";

const ObjectionCoverageCard = ({
  coveragePct = 78,
  totalAdded = 22,
  totalRecommended = 28,
  breakdown = [
    { category: "Pricing", count: 5, total: 6 },
    { category: "Timing", count: 4, total: 6 },
    { category: "Competition", count: 4, total: 5 },
    { category: "Information", count: 3, total: 4 },
    { category: "Other", count: 6, total: 7 },
  ],
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-dark-black/80 font-secondary">
        Objection Coverage
      </h3>

      {/* Circle Badge + Text */}
      <div className="flex items-center gap-3.5">
        {/* Circular Progress Gauge */}
        <div className="relative w-14 h-14 rounded-full border-4 border-primary/20 flex items-center justify-center shrink-0">
          <div
            className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent border-r-transparent -rotate-45"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
          />
          <span className="text-sm font-bold text-dark-black/90 font-secondary">
            {coveragePct}%
          </span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-dark-black/90 font-secondary">
            Strong
          </h4>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            {totalAdded} of {totalRecommended} objections added
          </p>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="space-y-2.5 pt-2 border-t border-light-gray/60">
        <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-1">
          By Category
        </span>

        {breakdown.map((item) => {
          const pct = Math.round((item.count / item.total) * 100);
          return (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-medium-black">{item.category}</span>
                <span className="font-semibold text-dark-black/80">
                  {item.count}/{item.total}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-light-gray overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ObjectionCoverageCard;

"use client";

import React from "react";

export default function DocumentInformation({ policy }) {
  return (
    <div className="bg-white rounded-3xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4 w-full">
      <h3 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary tracking-tight">
        Document Information
      </h3>

      <div className="space-y-3 text-xs">
        <div>
          <span className="text-light-black block font-medium">Category</span>
          <span className="font-semibold text-dark-black/85">
            {policy?.category || "Security"}
          </span>
        </div>

        <div>
          <span className="text-light-black block font-medium">Effective Date</span>
          <span className="font-semibold text-dark-black/85">
            {policy?.effectiveDate || "April 15, 2024"}
          </span>
        </div>

        <div>
          <span className="text-light-black block font-medium">Last Updated</span>
          <span className="font-semibold text-dark-black/85">
            {policy?.lastUpdated || "May 10, 2024"}
          </span>
        </div>

        <div>
          <span className="text-light-black block font-medium">Next Review</span>
          <span className="font-semibold text-dark-black/85">
            {policy?.nextUpdated || "May 10, 2025"}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { formatDate } from "@/lib/client-api";

const day = (value) => (value ? formatDate(`${value}T12:00:00`) : "Not set");

export default function DocumentInformation({ policy }) {
  const rows = [
    ["Category", policy.category],
    ["Owner", policy.owner?.name ?? "—"],
    ["Effective Date", day(policy.effectiveDate)],
    ["Last Updated", formatDate(policy.lastUpdated)],
    ["Next Review", day(policy.nextReviewDate), policy.reviewOverdue ? "Review overdue" : null],
    ["Signed during onboarding", policy.requireAcknowledgment ? policy.onboardingStep : "Not required"],
  ];
  return (
    <div className="bg-white rounded-3xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col space-y-4 w-full">
      <h3 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary tracking-tight">Document Information</h3>
      <div className="space-y-3 text-xs">
        {rows.map(([label, value, warning]) => (
          <div key={label}>
            <span className="text-light-black block font-medium">{label}</span>
            <span className="font-semibold text-dark-black/85">{value}</span>
            {warning && <span className="ml-1.5 text-[10px] font-semibold text-red">{warning}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

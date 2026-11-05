"use client";

import React from "react";

const AuditInfo = ({
  createdDate = "Jan 15, 2024, 9:21 AM",
  createdBy = "Daniel Miller",
  lastUpdated = "May 16, 2025, 10:30 AM",
  updatedBy = "Daniel Miller",
  lastLogin = "May 16, 2025, 9:42 AM",
  loginCount = 247,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 px-1 text-[11px] text-light-black">
      {/* Left: Audit Info Title & Creation Timestamp */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <strong className="font-bold text-dark-black/80 uppercase tracking-wide">
          AUDIT INFO
        </strong>
        <span>
          Created: {createdDate} by {createdBy}
        </span>
      </div>

      {/* Right: Last Updated, Last Login & Count */}
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
        <span>
          Last Updated: {lastUpdated} by {updatedBy}
        </span>
        <span className="hidden sm:inline text-light-gray">•</span>
        <span>Last Login: {lastLogin}</span>
        <span className="hidden sm:inline text-light-gray">•</span>
        <span>Login Count: <strong className="font-semibold text-dark-black/80">{loginCount}</strong></span>
      </div>
    </div>
  );
};

export default AuditInfo;

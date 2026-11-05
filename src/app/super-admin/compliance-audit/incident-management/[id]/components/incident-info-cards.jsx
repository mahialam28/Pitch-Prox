"use client";

import React from "react";
import Image from "next/image";

export default function IncidentInfoCards({ incident }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full">
      {/* 1. Reported by */}
      <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 shadow-xs flex flex-col justify-center">
        <span className="text-xs text-light-black font-medium mb-1.5">
          Reported by
        </span>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-light-gray shrink-0">
            <Image
              src={incident.reportedBy?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140"}
              alt={incident.reportedBy?.name || "Reporter"}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-dark-black/85 text-xs sm:text-sm font-secondary">
            {incident.reportedBy?.name || "Daniel Miller"}
          </span>
        </div>
      </div>

      {/* 2. Reported at */}
      <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 shadow-xs flex flex-col justify-center">
        <span className="text-xs text-light-black font-medium mb-1.5">
          Reported at
        </span>
        <div className="flex items-center gap-2 font-semibold text-dark-black/85 text-xs sm:text-sm font-secondary">
          <span>{incident.reportedAt || "May 19, 2024"}</span>
          <span className="text-light-black">•</span>
          <span className="text-medium-black">{incident.reportedTime || "10:24 AM"}</span>
        </div>
      </div>

      {/* 3. Assigned to */}
      <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 shadow-xs flex flex-col justify-center">
        <span className="text-xs text-light-black font-medium mb-1.5">
          Assigned to
        </span>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-light-gray shrink-0">
            <Image
              src={incident.assignedTo?.avatar || incident.reportedBy?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140"}
              alt={incident.assignedTo?.name || "Assignee"}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-dark-black/85 text-xs sm:text-sm font-secondary">
            {incident.assignedTo?.name || "Daniel Miller"}
          </span>
        </div>
      </div>
    </div>
  );
}

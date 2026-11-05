"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function ConversionFunnelCard() {
  const funnelStages = [
    {
      id: "delivered",
      label: "Delivered",
      value: "180.7K",
      percentage: "100%",
      width: 100,
      color: "bg-[#0EADAB]",
    },
    {
      id: "opened",
      label: "Opened",
      value: "88.9K",
      percentage: "49.2%",
      width: 49.2,
      color: "bg-[#2563EB]",
    },
    {
      id: "clicked",
      label: "Clicked",
      value: "23.6K",
      percentage: "13.1%",
      width: 13.1,
      color: "bg-[#7C3AED]",
    },
    {
      id: "converted",
      label: "Converted",
      value: "5.8K",
      percentage: "3.2%",
      width: 3.2,
      color: "bg-[#EA580C]",
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
          Conversion Funnel
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {funnelStages.map((stage, idx) => (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col gap-1.5">
              {/* Stage Header */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-dark-black/85 text-xs">
                    {stage.label}
                  </span>
                  <span className="font-bold text-dark-black/90 font-secondary text-xs">
                    {stage.value}
                  </span>
                </div>
                <span className="font-medium text-light-black text-[11px]">
                  {stage.percentage}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-light-gray rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${stage.color}`}
                  style={{ width: `${stage.width}%` }}
                />
              </div>
            </div>

            {/* Small Down Chevron Between Stages */}
            {idx < funnelStages.length - 1 && (
              <div className="flex justify-center -my-1">
                <ChevronDown className="w-3 h-3 text-light-black/50" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

export default function TopPerformingContent() {
  const items = [
    {
      id: "1",
      rank: 1,
      rankBg: "bg-emerald-50 text-emerald-600",
      title: "Trial Welcome",
      openRate: "52.0%",
      openGrowth: "6.4%",
      clickRate: "14.2%",
      clickGrowth: "2.8%",
    },
    {
      id: "2",
      rank: 2,
      rankBg: "bg-sky-50 text-sky-600",
      title: "Upgrade Offer",
      openRate: "48.7%",
      openGrowth: "5.1%",
      clickRate: "13.0%",
      clickGrowth: "2.3%",
    },
    {
      id: "3",
      rank: 3,
      rankBg: "bg-purple-50 text-purple-600",
      title: "Product Update",
      openRate: "45.6%",
      openGrowth: "4.8%",
      clickRate: "11.8%",
      clickGrowth: "2.0%",
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
          Top Performing Content
        </h3>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-semibold text-light-black uppercase tracking-wider border-b border-light-gray/60 pb-2">
              <th className="pb-2 text-left">CONTENT</th>
              <th className="pb-2 text-center px-2">OPEN RATE</th>
              <th className="pb-2 text-right">CLICK RATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/40 text-xs">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-light-gray/20 transition-colors">
                {/* Content Rank + Title */}
                <td className="py-3 text-left">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full ${item.rankBg} font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {item.rank}
                    </span>
                    <span className="font-semibold text-dark-black/90 text-xs whitespace-nowrap">
                      {item.title}
                    </span>
                  </div>
                </td>

                {/* Open Rate */}
                <td className="py-3 px-2 text-center whitespace-nowrap">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-dark-black/90 font-secondary text-xs">
                      {item.openRate}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold mt-0.5">
                      <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
                      {item.openGrowth}
                    </span>
                  </div>
                </td>

                {/* Click Rate */}
                <td className="py-3 text-right whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-dark-black/90 font-secondary text-xs">
                      {item.clickRate}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold mt-0.5">
                      <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
                      {item.clickGrowth}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

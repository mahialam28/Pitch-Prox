"use client";

import React from "react";
import { FileText, FileCode, Video, ChevronRight } from "lucide-react";

// counts: { PDF, Doc, Video }; selecting a card filters the grid (again to clear)
export default function BrowseFormat({ onSelectFormat, activeFormat, counts }) {
  const files = (key, noun) => (counts ? `${counts[key] ?? 0} ${noun}${counts[key] === 1 ? "" : "s"}` : "—");
  const formats = [
    {
      id: "PDF",
      title: "PDF",
      count: files("PDF", "file"),
      icon: FileText,
      iconBg: "bg-[#FEE4E2]",
      iconColor: "text-[#D92D20]",
    },
    {
      id: "Doc",
      title: "Doc",
      count: files("Doc", "file"),
      icon: FileCode,
      iconBg: "bg-[#EFF8FF]",
      iconColor: "text-[#175CD3]",
    },
    {
      id: "Video",
      title: "Video",
      count: files("Video", "video"),
      icon: Video,
      iconBg: "bg-[#EEF2FF]",
      iconColor: "text-[#4F46E5]",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
        Browse by Format
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          const isActive = activeFormat === fmt.id;
          return (
            <button
              type="button"
              key={fmt.id}
              aria-pressed={isActive}
              onClick={() => onSelectFormat?.(fmt.id)}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 cursor-pointer transition-all text-left w-full hover:shadow-sm ${
                isActive
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-light-gray hover:border-light-black/40"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl ${fmt.iconBg} ${fmt.iconColor} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-[13px] font-bold text-dark-black truncate">
                    {fmt.title}
                  </span>
                  <span className="text-[11px] text-light-black mt-0.5">
                    {fmt.count}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-light-black shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FileFormatCard({ selectedFormat = "csv", setSelectedFormat, onExport, disabled = false }) {
  const router = useRouter();

  // CSV opens in Excel, Numbers and Google Sheets
  const formats = [{ id: "csv", label: "CSV (opens in Excel)", icon: FileSpreadsheet }];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-8 h-full min-h-[420px]">
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
          File Format
        </h3>

        {/* 3 format selector cards */}
        <div className="grid grid-cols-1 gap-3">
          {formats.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setSelectedFormat(fmt.id)}
                className={`p-3.5 py-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-white text-dark-black border-light-gray hover:border-primary/40"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-light-black"}`} />
                <span className="text-xs font-bold leading-tight">
                  {fmt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer action buttons */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-light-gray/60">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs sm:text-sm font-bold text-dark-black/80 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onExport}
          disabled={disabled}
          className="disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl bg-primary hover:bg-[#0ca09e] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
}

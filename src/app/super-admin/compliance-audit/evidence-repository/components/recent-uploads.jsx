"use client";

import React from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import { recentUploadsData } from "../evidence-data";

export default function RecentUploads() {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 w-full space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-dark-black/85 font-secondary">
        Recent Uploads
      </h3>

      <div className="space-y-3.5 divide-y divide-light-gray/40">
        {recentUploadsData.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`flex items-center justify-between gap-3 ${
              idx > 0 ? "pt-3.5" : ""
            } hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  item.fileType === "pdf"
                    ? "bg-red-50 text-red-500"
                    : item.fileType === "xlsx"
                    ? "bg-emerald-50 text-emerald-500"
                    : "bg-blue-50 text-blue-500"
                }`}
              >
                {item.fileType === "xlsx" ? (
                  <FileSpreadsheet className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-dark-black/80 truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-light-black truncate">
                  {item.owner}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-medium text-light-black shrink-0">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

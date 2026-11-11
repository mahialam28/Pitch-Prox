"use client";

import React from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import { formatDate } from "@/lib/client-api";

// recent: the latest uploads (archived left out); onSelect opens the item
export default function RecentUploads({ recent, onSelect }) {
  const recentUploadsData = (recent ?? []).map((item) => ({ id: item.id, name: item.name, owner: `${item.uploadedBy ?? "—"} · ${item.file.name}`, date: formatDate(item.uploadedAt), fileType: item.file.type }));
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 w-full space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-dark-black/85 font-secondary">
        Recent Uploads
      </h3>

      <div className="space-y-3.5 divide-y divide-light-gray/40">
        {recent && recentUploadsData.length === 0 && <p className="text-xs text-light-black">Nothing uploaded yet.</p>}
        {recentUploadsData.map((item, idx) => (
          <div
            key={item.id || idx}
            role="button"
            tabIndex={0}
            onClick={() => onSelect?.(item.id)}
            onKeyDown={(event) => event.key === "Enter" && onSelect?.(item.id)}
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

"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import RadioCards from "@/components/shared/radio-cards";
import { showExportStartedToast } from "@/lib/toast";

// Design only: the export is not generated yet; confirming shows the "Export started" toast.

const DATE_RANGES = ["May 13, 2024 - May 19, 2024", "Last 30 days", "Last 90 days", "This year"];
const FORMATS = [
  { value: "csv", label: "CSV", description: "Spreadsheet" },
  { value: "json", label: "JSON", description: "Machine readable" },
];

export default function ExportLogsModal({ isOpen, onClose }) {
  const [range, setRange] = useState(DATE_RANGES[0]);
  const [includeContext, setIncludeContext] = useState(false);
  const [format, setFormat] = useState("csv");

  const exportLogs = () => {
    onClose();
    showExportStartedToast();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Audit Logs"
      subtitle="Exports respect your current filters."
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={exportLogs}>Export Logs</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="audit-export-range" className="block text-xs font-medium leading-4 text-medium-black mb-2">Date range</label>
          <div className="relative">
            <select
              id="audit-export-range"
              value={range}
              onChange={(event) => setRange(event.target.value)}
              className="w-full min-h-[44px] px-4 py-3 pr-10 rounded-xl border border-gray-300 bg-white text-base text-dark-black outline-none focus:border-primary appearance-none cursor-pointer transition-colors"
            >
              {DATE_RANGES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="w-[18px] h-[18px] text-dark-black/70 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <RadioCards label="File format" value={format} onChange={setFormat} options={FORMATS} />
        <label className="flex items-start gap-2.5 text-sm text-dark-black cursor-pointer">
          <input type="checkbox" checked={includeContext} onChange={(event) => setIncludeContext(event.target.checked)} className="mt-1 accent-primary" />
          <span>
            Include metadata &amp; client context
            <span className="block text-xs text-medium-black mt-0.5">
              Exports never include passwords, authentication or session tokens, API secrets, authorization headers, cookies or secret keys.
            </span>
          </span>
        </label>
      </div>
    </DialogModal>
  );
}

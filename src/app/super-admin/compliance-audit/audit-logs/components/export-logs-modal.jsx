"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import RadioCards from "@/components/shared/radio-cards";

// Downloads /api/v1/compliance/audit-logs/export with the page's filters (`query`).
// The range either keeps the page's own dates ("Current filters") or replaces them.
const DATE_RANGES = [
  { value: "filters", label: "Current filters" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "This year" },
];
const FORMATS = [
  { value: "csv", label: "CSV", description: "Spreadsheet" },
  { value: "json", label: "JSON", description: "Machine readable" },
];

export default function ExportLogsModal({ isOpen, onClose, query = "" }) {
  const [range, setRange] = useState("filters");
  const [includeContext, setIncludeContext] = useState(false);
  const [format, setFormat] = useState("csv");

  const params = new URLSearchParams(query);
  params.set("range", range);
  params.set("format", format);
  if (includeContext) params.set("context", "1");
  const href = `/api/v1/compliance/audit-logs/export?${params}`;

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Audit Logs"
      subtitle="Exports respect your current filters. Every export is itself recorded in the audit log."
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <a
            href={href}
            onClick={onClose}
            className="inline-flex items-center justify-center min-h-[40px] px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal transition-colors cursor-pointer"
          >
            Export Logs
          </a>
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
                <option key={option.value} value={option.value}>{option.label}</option>
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
              Adds event and user IDs, the browser (user agent) and each event&apos;s details. Exports never include passwords, authentication or session tokens, API secrets, authorization headers, cookies or secret keys.
            </span>
          </span>
        </label>
      </div>
    </DialogModal>
  );
}

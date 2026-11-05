"use client";

import React, { useState } from "react";
import { Ban, Check, ChevronDown } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { showExportStartedToast } from "@/lib/toast";
import RadioCards from "@/components/shared/radio-cards";

// Design-only dialogs for the Sales Reps screen: nothing is exported or deactivated on the server.

const DATE_RANGES = ["May 1, 2025 - May 31, 2025", "Apr 1, 2025 - Apr 30, 2025", "Last 90 days", "This year"];

const FORMATS = [
  { value: "pdf", label: "PDF", description: "Formatted report" },
  { value: "csv", label: "CSV", description: "Raw data for spreadsheets" },
];

const Checkbox = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" />
    <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </span>
    <span className="text-sm text-medium-black">{children}</span>
  </label>
);

export const ExportTeamReportModal = ({ isOpen, onClose }) => {
  const [range, setRange] = useState(DATE_RANGES[0]);
  const [format, setFormat] = useState("pdf");
  const [includeQuota, setIncludeQuota] = useState(true);
  const [includeCoaching, setIncludeCoaching] = useState(false);

  const exportReport = () => {
    onClose();
    showExportStartedToast();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Team Performance Report"
      subtitle="Download performance data for your sales team."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={exportReport}>Export Report</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="export-range" className="block text-xs font-medium leading-4 text-medium-black mb-2">Date range</label>
          <div className="relative">
            <select
              id="export-range"
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

        <div className="space-y-3">
          <Checkbox checked={includeQuota} onChange={setIncludeQuota}>Include quota progress</Checkbox>
          <Checkbox checked={includeCoaching} onChange={setIncludeCoaching}>Include coaching notes</Checkbox>
        </div>
      </div>
    </DialogModal>
  );
};

export const DeactivateRepModal = ({ rep, onClose, onConfirm }) => (
  <ConfirmDialog
    isOpen={Boolean(rep)}
    onClose={onClose}
    title="Deactivate this rep?"
    icon={Ban}
    iconTone="warning"
    message={`${rep?.name ?? "This rep"} will be signed out and removed from leaderboards and quota tracking.`}
    note="Open leads can be reassigned after deactivation."
    confirmLabel="Deactivate Rep"
    onConfirm={() => onConfirm?.(rep)}
  />
);

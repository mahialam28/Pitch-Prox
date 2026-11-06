"use client";

import React, { useState } from "react";
import { Ban, Check } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { showSavedToast } from "@/lib/toast";
import { downloadTeamCsv } from "../team-api";
import RadioCards from "@/components/shared/radio-cards";

// Export downloads the roster as a CSV; deactivation is confirmed here and saved by the caller.
const FORMATS = [{ value: "csv", label: "CSV", description: "Opens in Excel, Numbers or Google Sheets" }];

const Checkbox = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" />
    <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </span>
    <span className="text-sm text-medium-black">{children}</span>
  </label>
);

export const ExportTeamReportModal = ({ isOpen, onClose, reps = [], monthLabel = "" }) => {
  const [format, setFormat] = useState("csv");
  const [includeQuota, setIncludeQuota] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);

  const exportReport = () => {
    const rows = includeInactive ? reps : reps.filter((rep) => rep.status !== "deactivated");
    downloadTeamCsv(rows, monthLabel, { includeQuota });
    onClose();
    showSavedToast("Report downloaded", `${rows.length} rep${rows.length === 1 ? "" : "s"} for ${monthLabel}.`);
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
        <p className="text-sm text-medium-black">Period: <span className="font-semibold text-dark-black">{monthLabel}</span></p>

        <RadioCards label="File format" value={format} onChange={setFormat} options={FORMATS} />

        <div className="space-y-3">
          <Checkbox checked={includeQuota} onChange={setIncludeQuota}>Include quota progress</Checkbox>
          <Checkbox checked={includeInactive} onChange={setIncludeInactive}>Include deactivated reps</Checkbox>
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
    message={`${rep?.name ?? "This rep"} will be signed out and removed from leaderboards and quota tracking. You can reactivate them later.`}
    note="Their leads and customer accounts stay assigned to them; reassign them from the CRM or the customer page, or run Offboarding instead."
    confirmLabel="Deactivate Rep"
    onConfirm={() => onConfirm?.(rep)}
  />
);

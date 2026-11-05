"use client";

import React from "react";
import DatePicker from "@/components/modals/date-picker";
import { EVIDENCE_OWNERS, SOC2_CONTROLS, TRUST_SERVICE_CRITERIA } from "../evidence-options";

// Shared by Upload Evidence and Edit Evidence:
// Associated Controls and Trust Service Criteria (multi-select), Evidence Owner, Evidence Expiration.
// value: { controls: [], criteria: [], owner, expires: "never" | "on", expiryDate }
const Pill = ({ active, onClick, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-pressed={active}
    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${active ? "bg-primary/10 border-primary text-primary" : "bg-white border-light-gray text-medium-black hover:border-primary/40"}`}
  >
    {children}
  </button>
);

const toggle = (list, item) => (list.includes(item) ? list.filter((value) => value !== item) : [...list, item]);

export default function EvidenceFields({ value, onChange }) {
  const set = (changes) => onChange({ ...value, ...changes });
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <label className="font-semibold text-dark-black/80 block">Associated Controls</label>
        <div className="flex flex-wrap gap-1.5">
          {SOC2_CONTROLS.map((control) => (
            <Pill key={control.id} title={control.name} active={value.controls.includes(control.id)} onClick={() => set({ controls: toggle(value.controls, control.id) })}>
              {control.id}
            </Pill>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-semibold text-dark-black/80 block">Trust Service Criteria</label>
        <div className="flex flex-wrap gap-1.5">
          {TRUST_SERVICE_CRITERIA.map((criterion) => (
            <Pill key={criterion} active={value.criteria.includes(criterion)} onClick={() => set({ criteria: toggle(value.criteria, criterion) })}>
              {criterion}
            </Pill>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="evidence-owner" className="font-semibold text-dark-black/80 block">Evidence Owner</label>
          <select
            id="evidence-owner"
            value={value.owner}
            onChange={(event) => set({ owner: event.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 bg-white font-medium text-xs outline-none focus:border-primary"
          >
            {EVIDENCE_OWNERS.map((owner) => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <span className="font-semibold text-dark-black/80 block">Evidence Expiration</span>
          <div className="flex items-center gap-4 text-xs font-medium text-dark-black/80 py-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="evidence-expiration" checked={value.expires === "never"} onChange={() => set({ expires: "never", expiryDate: "" })} className="accent-primary" />
              Does Not Expire
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="evidence-expiration" checked={value.expires === "on"} onChange={() => set({ expires: "on" })} className="accent-primary" />
              Expires On
            </label>
          </div>
        </div>
      </div>

      {value.expires === "on" && (
        <div className="space-y-1.5">
          <label className="font-semibold text-dark-black/80 block">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <DatePicker value={value.expiryDate} onChange={(date) => set({ expiryDate: date })} placeholder="Select date" placement="top" />
        </div>
      )}
    </div>
  );
}

// Checks before saving; returns an error message or null
export const evidenceFieldsError = (value) => (value.expires === "on" && !value.expiryDate ? "Choose an expiration date, or select Does Not Expire." : null);

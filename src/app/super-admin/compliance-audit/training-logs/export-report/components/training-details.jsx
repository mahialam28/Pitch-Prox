"use client";

import React from "react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { TRAINING_DEPARTMENTS, TRAINING_STATUSES } from "../../training-options";

const statusOptions = [{ value: "All", label: "All Statuses" }, ...TRAINING_STATUSES.map((value) => ({ value, label: value }))];
const departmentOptions = [{ value: "All", label: "All Departments" }, ...TRAINING_DEPARTMENTS.map((value) => ({ value, label: value }))];
const dropdownProps = { variant: "compact", className: "w-full", buttonClassName: "py-2.5 text-xs sm:text-sm font-medium" };

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold text-medium-black">{label}</span>
    {children}
  </div>
);

// The Training Assignment Report is the only report, so it's shown instead of a Report Type list
// (client item). filters: { training, status, department, from, to }
export default function TrainingDetails({ trainings, filters, setFilter }) {
  const trainingOptions = [{ value: "All", label: "All Trainings" }, ...(trainings ?? []).map((training) => ({ value: training.id, label: training.title }))];
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">Report Details</h3>

      <Field label="Report Type">
        <div className="h-10 px-3.5 flex items-center rounded-xl border border-light-gray bg-light-gray/30 text-xs sm:text-sm font-medium text-dark-black">Training Assignment Report</div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Training"><Dropdown items={trainingOptions} selected={filters.training} onSelect={(value) => setFilter("training", value)} {...dropdownProps} /></Field>
        <Field label="Status"><Dropdown items={statusOptions} selected={filters.status} onSelect={(value) => setFilter("status", value)} {...dropdownProps} /></Field>
        <Field label="Department"><Dropdown items={departmentOptions} selected={filters.department} onSelect={(value) => setFilter("department", value)} {...dropdownProps} /></Field>
      </div>

      <Field label="Date Range (assigned on)">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input type="date" aria-label="From date" value={filters.from} max={filters.to || undefined} onChange={(event) => setFilter("from", event.target.value)} className="flex-1 h-10 px-3 rounded-xl border border-light-gray text-xs sm:text-sm outline-none focus:border-primary" />
          <span className="text-xs text-light-black text-center">to</span>
          <input type="date" aria-label="To date" value={filters.to} min={filters.from || undefined} onChange={(event) => setFilter("to", event.target.value)} className="flex-1 h-10 px-3 rounded-xl border border-light-gray text-xs sm:text-sm outline-none focus:border-primary" />
        </div>
      </Field>
    </div>
  );
}

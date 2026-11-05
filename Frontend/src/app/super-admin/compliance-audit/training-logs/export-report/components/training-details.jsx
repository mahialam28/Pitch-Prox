"use client";

import React, { useState } from "react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { TRAINING_DEPARTMENTS, TRAINING_STATUSES } from "../../training-options";

const reportTypeOptions = [
  { value: "Training Assignment Report", label: "Training Assignment Report" },
  { value: "Completion Summary", label: "Completion Summary" },
  { value: "Overdue Training Logs", label: "Overdue Training Logs" },
  { value: "Department Compliance Breakdown", label: "Department Compliance Breakdown" },
];

// Active Trainings (complete courses, not individual materials)
const TRAININGS = ["Security Awareness Training", "Data Privacy & GDPR Basics", "Code of Conduct", "Anti-Harassment Training", "Sales Compliance & Call Recording", "Customer Support Escalation Policy"];
const trainingOptions = [{ value: "All", label: "All Trainings" }, ...TRAININGS.map((value) => ({ value, label: value }))];
const statusOptions = [{ value: "All", label: "All Statuses" }, ...TRAINING_STATUSES.map((value) => ({ value, label: value }))];
const departmentOptions = [{ value: "All", label: "All Departments" }, ...TRAINING_DEPARTMENTS.map((value) => ({ value, label: value }))];

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-medium-black">{label}</label>
    {children}
  </div>
);
const dropdownProps = { variant: "compact", className: "w-full", buttonClassName: "py-2.5 text-xs sm:text-sm font-medium" };

export default function TrainingDetails({ selectedReportType, setSelectedReportType }) {
  const [training, setTraining] = useState("All");
  const [status, setStatus] = useState("All");
  const [department, setDepartment] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">Report Details</h3>

      <Field label="Report Type">
        <Dropdown items={reportTypeOptions} selected={selectedReportType} onSelect={(val) => setSelectedReportType(val)} {...dropdownProps} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Training">
          <Dropdown items={trainingOptions} selected={training} onSelect={setTraining} {...dropdownProps} />
        </Field>
        <Field label="Status">
          <Dropdown items={statusOptions} selected={status} onSelect={setStatus} {...dropdownProps} />
        </Field>
        <Field label="Department">
          <Dropdown items={departmentOptions} selected={department} onSelect={setDepartment} {...dropdownProps} />
        </Field>
      </div>

      <Field label="Date Range">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input type="date" aria-label="From date" value={from} onChange={(event) => setFrom(event.target.value)} className="flex-1 h-10 px-3 rounded-xl border border-light-gray text-xs sm:text-sm outline-none focus:border-primary" />
          <span className="text-xs text-light-black text-center">to</span>
          <input type="date" aria-label="To date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="flex-1 h-10 px-3 rounded-xl border border-light-gray text-xs sm:text-sm outline-none focus:border-primary" />
        </div>
      </Field>
    </div>
  );
}

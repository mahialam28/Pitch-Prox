"use client";

import React from "react";
import { Calendar } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Checkbox from "@/components/shared/checkbox";

const priorityOptions = [
  { value: "Required", label: "Required" },
  { value: "Recommended", label: "Recommended" },
  { value: "Optional", label: "Optional" },
];

export default function AssignmentSettings({
  dueDate,
  setDueDate,
  priority,
  setPriority,
  sendNotification,
  setSendNotification,
  allowReassignment,
  setAllowReassignment,
}) {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
        Assignment Settings
      </h3>

      {/* Due Date */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bulk-due-date" className="text-xs font-semibold text-medium-black">
          Due date
        </label>
        <div className="relative">
          <Calendar className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="bulk-due-date"
            type="date"
            value={dueDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs sm:text-sm text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Requirement */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-medium-black">
          Requirement
        </label>
        <Dropdown
          items={priorityOptions}
          selected={priority}
          onSelect={(val) => setPriority(val)}
          variant="compact"
          className="w-full"
          buttonClassName="py-2.5 text-xs sm:text-sm font-medium"
        />
      </div>

      {/* Checkbox Options */}
      <div className="flex flex-col gap-2.5 pt-1">
        <Checkbox
          checked={sendNotification}
          onChange={(val) => setSendNotification(val)}
          label="Send assignment notification"
        />

        <Checkbox
          checked={allowReassignment}
          onChange={(val) => setAllowReassignment(val)}
          label="Allow reassignment if already completed"
        />
      </div>
    </div>
  );
}

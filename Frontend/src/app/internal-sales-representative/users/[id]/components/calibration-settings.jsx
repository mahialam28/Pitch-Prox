"use client";

import React, { useState } from "react";
import { Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";

const FREQUENCY_OPTIONS = [
  { value: "30", label: "Every 30 days" },
  { value: "60", label: "Every 60 days" },
  { value: "90", label: "Every 90 days" },
  { value: "180", label: "Every 180 days" },
];

const REMINDER_OPTIONS = [
  { value: "3", label: "3 days before due date" },
  { value: "7", label: "7 days before due date" },
  { value: "14", label: "14 days before due date" },
];

export default function CalibrationSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [frequency, setFrequency] = useState("90");
  const [reminder, setReminder] = useState("7");
  const [allowEarly, setAllowEarly] = useState(true);

  const handleToggleAllowEarly = () => {
    const nextVal = !allowEarly;
    setAllowEarly(nextVal);
    toast.success(nextVal ? "Early calibration enabled." : "Early calibration disabled.");
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Calibration settings saved!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-light-gray/70">
        <h3 className="text-base font-bold text-dark-black/85">
          Calibration Settings
        </h3>
        <button
          type="button"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="px-3 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5 text-light-black" />
          <span>{isEditing ? "Save" : "Edit"}</span>
        </button>
      </div>

      {/* Settings Rows */}
      <div className="divide-y divide-light-gray/60 text-xs">
        {/* Frequency */}
        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Calibration Frequency</span>
          {isEditing ? (
            <div className="w-[160px]">
              <Dropdown
                items={FREQUENCY_OPTIONS}
                selected={frequency}
                onSelect={setFrequency}
                variant="small"
                className="w-full"
                buttonClassName="h-8 text-xs font-semibold"
              />
            </div>
          ) : (
            <span className="font-semibold text-dark-black/85">
              {FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label || "Every 90 days"}
            </span>
          )}
        </div>

        {/* Reminder */}
        <div className="py-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Reminder</span>
          {isEditing ? (
            <div className="w-[180px]">
              <Dropdown
                items={REMINDER_OPTIONS}
                selected={reminder}
                onSelect={setReminder}
                variant="small"
                className="w-full"
                buttonClassName="h-8 text-xs font-semibold"
              />
            </div>
          ) : (
            <span className="font-semibold text-dark-black/85">
              {REMINDER_OPTIONS.find((r) => r.value === reminder)?.label || "7 days before due date"}
            </span>
          )}
        </div>

        {/* Allow Early Calibration */}
        <div className="pt-2.5 flex items-center justify-between gap-2">
          <span className="text-light-black font-medium">Allow Early Calibration</span>
          <button
            type="button"
            onClick={handleToggleAllowEarly}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              allowEarly ? "bg-teal-600" : "bg-light-gray"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                allowEarly ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

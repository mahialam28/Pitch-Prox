"use client";

import React from "react";
import Checkbox from "@/components/shared/checkbox";
import { TRAINING_REPORT_FIELDS } from "@/lib/compliance/training-catalog";

// Same columns the server can export (lib/compliance/training-catalog)
const allFieldList = TRAINING_REPORT_FIELDS;

export default function ReportFields({ selectedFields, setSelectedFields }) {
  const isAllSelected = selectedFields.length === allFieldList.length;
  const isIndeterminate =
    selectedFields.length > 0 && selectedFields.length < allFieldList.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFields([]);
    } else {
      setSelectedFields([...allFieldList]);
    }
  };

  const handleToggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header with Select All toggle */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
          Choose Report Fields
        </h3>
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleToggleSelectAll}
          label="Select all"
          className="font-semibold text-dark-black/85"
        />
      </div>

      {/* Checkboxes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-4 pt-1">
        {allFieldList.map((field) => {
          const isChecked = selectedFields.includes(field);
          return (
            <Checkbox
              key={field}
              checked={isChecked}
              onChange={() => handleToggleField(field)}
              label={field}
            />
          );
        })}
      </div>
    </div>
  );
}

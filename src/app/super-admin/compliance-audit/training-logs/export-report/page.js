"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import TrainingDetails from "./components/training-details";
import ReportFields from "./components/report-fields";
import ExportSummary from "./components/export-summary";
import FileFormatCard from "./components/file-format-card";

export default function ExportReportPage() {
  const [selectedReportType, setSelectedReportType] = useState(
    "Training Assignment Report"
  );
  const [selectedFields, setSelectedFields] = useState([
    "Employee Name",
    "Category",
    "Status",
    "Assigned On",
    "Completed On",
    "Training",
    "Due Date",
  ]);
  const [selectedFormat, setSelectedFormat] = useState("excel");

  const handleExport = () => {
    toast.success(
      `Exporting report as ${selectedFormat.toUpperCase()} with ${selectedFields.length} fields!`
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col gap-1.5">
        <Link
          href="/super-admin/compliance-audit/training-logs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Training Logs</span>
          <span className="text-light-black">/</span>
          <span className="text-medium-black">Export Training Report</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">
          Export Training Report
        </h1>
        <p className="text-xs sm:text-sm text-medium-black">
          Create and download a customized employee training report.
        </p>
      </div>

      {/* Main Grid: Left side (2/3) and Right side (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full min-w-0">
          <TrainingDetails
            selectedReportType={selectedReportType}
            setSelectedReportType={setSelectedReportType}
          />

          <ReportFields
            selectedFields={selectedFields}
            setSelectedFields={setSelectedFields}
          />

          <ExportSummary
            totalAssignments={256}
            dateRange="Apr 1, 2024 - May 31, 2024"
            appliedFilters="All statuses, All departments, All training types"
            fieldsCount={selectedFields.length}
          />
        </div>

        {/* Right Column (col-span-4) */}
        <div className="lg:col-span-4 w-full flex flex-col">
          <FileFormatCard
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
}

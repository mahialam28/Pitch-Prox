"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TrainingDetails from "./components/training-details";
import ReportFields from "./components/report-fields";
import ExportSummary from "./components/export-summary";
import FileFormatCard from "./components/file-format-card";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { TRAINING_REPORT_FIELDS } from "@/lib/compliance/training-catalog";

const day = (value) => new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function ExportReportPage() {
  const [trainings, setTrainings] = useState(null);
  const [filters, setFilters] = useState({ training: "All", status: "All", department: "All", from: "", to: "" });
  const [selectedFields, setSelectedFields] = useState(TRAINING_REPORT_FIELDS.slice(0, 11));
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [count, setCount] = useState(null);

  useEffect(() => {
    apiRequest("/api/v1/compliance/training/courses").then((data) => setTrainings(data.results)).catch((error) => showError("Trainings not loaded", error.message));
  }, []);

  const params = new URLSearchParams({ ...filters, fields: selectedFields.join(",") });
  const query = params.toString();
  // How many rows the report will have (updates as filters change)
  useEffect(() => {
    let cancelled = false;
    apiRequest(`/api/v1/compliance/training/export?${query}&count=1`)
      .then((data) => !cancelled && setCount(data.rows))
      .catch(() => !cancelled && setCount(null));
    return () => { cancelled = true; };
  }, [query]);

  const applied = [
    filters.training === "All" ? "All Trainings" : trainings?.find((training) => training.id === filters.training)?.title,
    filters.status === "All" ? "All statuses" : filters.status,
    filters.department === "All" ? "All departments" : filters.department,
  ].filter(Boolean).join(", ");
  const range = filters.from || filters.to ? `${filters.from ? day(filters.from) : "Start"} – ${filters.to ? day(filters.to) : "Today"}` : "All dates";

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-1.5">
        <Link href="/super-admin/compliance-audit/training-logs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors w-fit">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Training Logs</span>
          <span className="text-light-black">/</span>
          <span className="text-medium-black">Export Training Report</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">Export Training Report</h1>
        <p className="text-xs sm:text-sm text-medium-black">Create and download a customized employee training report.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-6 w-full min-w-0">
          <TrainingDetails trainings={trainings} filters={filters} setFilter={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} />
          <ReportFields selectedFields={selectedFields} setSelectedFields={setSelectedFields} />
          <ExportSummary totalAssignments={count} dateRange={range} appliedFilters={applied} fieldsCount={selectedFields.length} />
        </div>
        <div className="lg:col-span-4 w-full flex flex-col">
          <FileFormatCard
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            disabled={!selectedFields.length}
            onExport={() => window.location.assign(`/api/v1/compliance/training/export?${query}`)}
          />
        </div>
      </div>
    </div>
  );
}

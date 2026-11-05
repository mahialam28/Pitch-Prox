"use client";

import React, { useState } from "react";
import ReportsTabHeader from "./reports-tab-header";
import ReportsStats from "./reports-stats";
import ReportsTable, { defaultReportsData } from "./reports-table";
import ReportDetailCard from "./report-detail-card";
import GenerateReportModal from "./generate-report-modal";
import FullReportModal from "./full-report-modal";

export default function ReportsTab({ rep, onTabChange }) {
  const repName = rep?.name || "Ryan Anderson";

  // Filter States
  const [dateRange, setDateRange] = useState("Jun 1 – Jun 30, 2026");
  const [reportType, setReportType] = useState("All report types");
  const [leadType, setLeadType] = useState("All lead types");
  const [scoreFilter, setScoreFilter] = useState("All scores");

  // Reports data & selection
  const [reportsList, setReportsList] = useState(defaultReportsData);
  const [selectedReport, setSelectedReport] = useState(defaultReportsData[0]);

  // Modals state
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [fullReportModalOpen, setFullReportModalOpen] = useState(false);
  const [activeModalReport, setActiveModalReport] = useState(null);

  const handleResetFilters = () => {
    setDateRange("Jun 1 – Jun 30, 2026");
    setReportType("All report types");
    setLeadType("All lead types");
    setScoreFilter("All scores");
  };

  const handleReportCreated = (newReport) => {
    setReportsList((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
  };

  const handleOpenFullReport = (report) => {
    setActiveModalReport(report || selectedReport);
    setFullReportModalOpen(true);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-light-gray shadow-xs flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1. Header with Title, Description, Filter Dropdowns, & Generate Report CTA */}
      <ReportsTabHeader
        repName={repName}
        dateRange={dateRange}
        setDateRange={setDateRange}
        reportType={reportType}
        setReportType={setReportType}
        leadType={leadType}
        setLeadType={setLeadType}
        scoreFilter={scoreFilter}
        setScoreFilter={setScoreFilter}
        onResetFilters={handleResetFilters}
        onGenerateReport={() => setGenerateModalOpen(true)}
      />

      {/* 2. Top 4 Metric KPI Cards */}
      <ReportsStats />

      {/* 3. Main Two-Column Layout (Report History Table + Selected Report Detail Card) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Report History Table */}
        <div className="w-full lg:col-span-8">
          <ReportsTable
            reports={reportsList}
            selectedReport={selectedReport}
            onSelectReport={(repItem) => setSelectedReport(repItem)}
            onViewFullReport={handleOpenFullReport}
            onViewActivityLog={() => {
              if (onTabChange) onTabChange("activity-log");
            }}
            reportTypeFilter={reportType}
            leadTypeFilter={leadType}
            scoreFilter={scoreFilter}
          />
        </div>

        {/* Right Column (4 cols): Selected Report Detail Card */}
        <div className="w-full lg:col-span-4">
          <ReportDetailCard
            report={selectedReport}
            onViewFullReport={handleOpenFullReport}
          />
        </div>
      </div>

      {/* ── Interactive Modals ── */}
      <GenerateReportModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        repName={repName}
        onReportCreated={handleReportCreated}
      />

      <FullReportModal
        isOpen={fullReportModalOpen}
        onClose={() => setFullReportModalOpen(false)}
        report={activeModalReport || selectedReport}
      />
    </div>
  );
}

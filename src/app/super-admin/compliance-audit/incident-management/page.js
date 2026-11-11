"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IncidentStats from "./components/incident-stats";
import IncidentTable from "./components/incident-table";
import IncidentSummary from "./components/incident-summary";
import IncidentsByCategory from "./components/incidents-by-category";
import IncidentBanner from "./components/incident-banner";
import ReportIncidentModal from "./components/report-incident-modal";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

export default function IncidentManagementPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const load = useCallback(
    () => apiRequest("/api/v1/compliance/incidents").then(setData).catch((error) => showError("Incidents not loaded", error.message)),
    []
  );
  useEffect(() => {
    load();
  }, [load]);
  const incidents = data?.results ?? [];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All Severity");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedOwner, setSelectedOwner] = useState("All Owners");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  // Table tabs: All Incidents, Escalated Tickets (raised from a support ticket), Investigating, Resolved
  const [activeTab, setActiveTab] = useState("all");
  const TABS = [
    { id: "all", label: "All Incidents", match: () => true },
    { id: "escalated", label: "Escalated Tickets", match: (item) => Boolean(item.relatedTicket) },
    { id: "investigating", label: "Investigating", match: (item) => item.status === "Investigating" },
    { id: "resolved", label: "Resolved", match: (item) => item.status === "Resolved" || item.status === "Closed" },
  ];

  // Filter incidents
  const filteredIncidents = incidents.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.relatedTicket?.reference ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reportedBy.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === "All Severity" ||
      item.severity.toLowerCase() === selectedSeverity.toLowerCase();

    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === "All Statuses" ||
      item.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesOwner =
      selectedOwner === "All Owners" ||
      item.assignedTo?.name === selectedOwner;

    return (
      TABS.find((tab) => tab.id === activeTab).match(item) &&
      matchesSearch &&
      matchesSeverity &&
      matchesCategory &&
      matchesStatus &&
      matchesOwner
    );
  });

  const handleCreateIncident = (result) => {
    load();
    router.push(`/super-admin/compliance-audit/incident-management/${result.incident.id}`);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">
          Incident Management
        </h1>
        <p className="text-xs sm:text-sm text-medium-black">
          Track, manage, and resolve security and operational incidents.
        </p>
      </div>

      {/* ── 2. Top Stats KPI Cards ── */}
      <IncidentStats stats={data?.stats} />

      {/* ── 3. Main 2-Column Section (Table + Right Breakdown Widgets) ── */}
      <div className="flex flex-col gap-6 w-full">
        {/* Table (full width so every column fits) */}
        <div className="w-full min-w-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Incident views">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${activeTab === tab.id ? "bg-primary text-white border-primary" : "bg-white text-medium-black border-light-gray hover:text-dark-black"}`}
              >
                {tab.label} <span className="opacity-70">({incidents.filter(tab.match).length})</span>
              </button>
            ))}
          </div>
          <IncidentTable
            incidents={filteredIncidents}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={setSelectedSeverity}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedOwner={selectedOwner}
            setSelectedOwner={setSelectedOwner}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            owners={data?.managers ?? []}
            canReport={Boolean(data?.permissions.manage)}
          />
        </div>

        {/* Incident Summary (Donut) & Top Incident Categories, below the table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <IncidentSummary summary={data?.summary} />
          <IncidentsByCategory top={data?.topCategories} total={data?.stats.total ?? 0} />
        </div>
      </div>

      {/* ── 4. Bottom Information & Help Banner ── */}
      <IncidentBanner />

      {/* ── 5. Report New Incident Modal ── */}
      {isReportModalOpen && <ReportIncidentModal
        managers={data?.managers ?? []}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={handleCreateIncident}
      />}
    </div>
  );
}

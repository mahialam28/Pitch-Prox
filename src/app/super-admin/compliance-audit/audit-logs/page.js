"use client";

import React, { useEffect, useState } from "react";
import AuditStats from "./components/audit-stats";
import AuditTable from "./components/audit-table";
import AuditFiltersSidebar from "./components/audit-filters-sidebar";
import ExportLogsModal from "./components/export-logs-modal";
import { categoryLabelOf, tabIdOf } from "./audit-logs-data";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Filters the right-hand panel edits; they apply when "Apply Filters" is pressed
const EMPTY_PANEL = { action: "", entity: "", user: "", ip: "", from: "", to: "" };

// Query string for the API (shared by the list and the export)
function auditQuery({ category, search, filters }) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  return params;
}

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState(EMPTY_PANEL);
  const [applied, setApplied] = useState(EMPTY_PANEL);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Search waits for a short pause in typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryString = auditQuery({ category: activeTab, search, filters: applied }).toString();

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(queryString);
    params.set("page", currentPage);
    params.set("pageSize", pageSize);
    apiRequest(`/api/v1/compliance/audit-logs?${params}`)
      .then((result) => !cancelled && setData(result))
      .catch((error) => !cancelled && showError("Audit logs not loaded", error.message));
    return () => { cancelled = true; };
  }, [queryString, currentPage, pageSize]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setPanel(EMPTY_PANEL);
    setApplied(EMPTY_PANEL);
    setSearchTerm("");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const applyFilters = () => {
    if (panel.from && panel.to && panel.from > panel.to) {
      showError("Check the dates", "The start date must be before the end date.");
      return;
    }
    setApplied(panel);
    setCurrentPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">Audit Logs</h1>
        <p className="text-xs sm:text-sm text-medium-black font-normal">Immutable record of key system activities and admin actions.</p>
      </div>

      <AuditStats stats={data?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-8 xl:col-span-9 w-full min-w-0">
          <AuditTable
            logs={data?.results ?? []}
            loading={!data}
            activeTab={activeTab}
            setActiveTab={changeTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalEvents={data?.total ?? 0}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        </div>

        <div className="lg:col-span-4 xl:col-span-3 w-full">
          <AuditFiltersSidebar
            options={data?.options}
            selectedCategory={categoryLabelOf(activeTab)}
            setSelectedCategory={(label) => changeTab(tabIdOf(label))}
            filters={panel}
            setFilter={(key, value) => setPanel((current) => ({ ...current, [key]: value }))}
            onResetFilters={resetFilters}
            onApplyFilters={applyFilters}
          />
        </div>
      </div>

      <ExportLogsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        query={queryString}
      />
    </div>
  );
}

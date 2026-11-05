"use client";

import React, { useState } from "react";
import AuditStats from "./components/audit-stats";
import AuditTable from "./components/audit-table";
import AuditFiltersSidebar from "./components/audit-filters-sidebar";
import ExportLogsModal from "./components/export-logs-modal";
import { initialAuditLogs, categoryLabelOf, tabIdOf } from "./audit-logs-data";
import toast from "react-hot-toast";

export default function AuditLogsPage() {
  const [logs] = useState(initialAuditLogs);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [selectedEntity, setSelectedEntity] = useState("All Entities");
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedIp, setSelectedIp] = useState("All IP Addresses");

  // Sidebar Filters State
  const [sidebarAction, setSidebarAction] = useState("All Actions");
  const [sidebarUser, setSidebarUser] = useState("All Users");
  const [sidebarIp, setSidebarIp] = useState("");
  const [dateRange, setDateRange] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filter logs logic
  const filteredLogs = logs.filter((item) => {
    // Tab Filter
    if (activeTab !== "all" && item.categoryKey !== activeTab) {
      return false;
    }

    // Search Term Filter
    const matchesSearch =
      !searchTerm ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());

    // Inline Table Toolbar Filters
    const matchesAction =
      selectedAction === "All Actions" ||
      item.action.toLowerCase() === selectedAction.toLowerCase();

    const matchesEntity =
      selectedEntity === "All Entities" ||
      item.entity.toLowerCase() === selectedEntity.toLowerCase();

    const matchesUser =
      selectedUser === "All Users" ||
      item.user.name.toLowerCase() === selectedUser.toLowerCase();

    const matchesIp =
      selectedIp === "All IP Addresses" ||
      item.ipAddress.toLowerCase() === selectedIp.toLowerCase();

    // Sidebar Filters
    // The Category filter and the category tabs are the same filter (activeTab)
    const matchesSidebarCategory = true;

    const matchesSidebarAction =
      sidebarAction === "All Actions" ||
      item.action.toLowerCase() === sidebarAction.toLowerCase();

    const matchesSidebarUser =
      sidebarUser === "All Users" ||
      item.user.name.toLowerCase() === sidebarUser.toLowerCase();

    const matchesSidebarIp =
      !sidebarIp ||
      item.ipAddress.toLowerCase().includes(sidebarIp.toLowerCase());

    return (
      matchesSearch &&
      matchesAction &&
      matchesEntity &&
      matchesUser &&
      matchesIp &&
      matchesSidebarCategory &&
      matchesSidebarAction &&
      matchesSidebarUser &&
      matchesSidebarIp
    );
  });

  const handleResetFilters = () => {
    
    setSidebarAction("All Actions");
    setSidebarUser("All Users");
    setSidebarIp("");
    setDateRange("");
    setSelectedAction("All Actions");
    setSelectedEntity("All Entities");
    setSelectedUser("All Users");
    setSelectedIp("All IP Addresses");
    setSearchTerm("");
    setActiveTab("all");
    setCurrentPage(1);
    toast.success("Audit filters reset to default.");
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    toast.success("Filters applied successfully!");
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">
          Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-medium-black font-normal">
          Immutable record of key system activities and admin actions.
        </p>
      </div>

      {/* ── 2. Top Stats KPI Cards ── */}
      <AuditStats />

      {/* ── 3. Main 2-Column Section (Table + Right Filter Sidebar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Tabs, Filters, Table & Pagination (approx 72%) */}
        <div className="lg:col-span-8 xl:col-span-9 w-full min-w-0">
          <AuditTable
            logs={filteredLogs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            selectedEntity={selectedEntity}
            setSelectedEntity={setSelectedEntity}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            selectedIp={selectedIp}
            setSelectedIp={setSelectedIp}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalEvents={1248}
            showInlineFilters={false}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        </div>

        {/* Right Column: Filter Sidebar (approx 28%) */}
        <div className="lg:col-span-4 xl:col-span-3 w-full">
          <AuditFiltersSidebar
            selectedCategory={categoryLabelOf(activeTab)}
            setSelectedCategory={(label) => {
              setActiveTab(tabIdOf(label));
              setCurrentPage(1);
            }}
            selectedEntity={selectedEntity}
            setSelectedEntity={setSelectedEntity}
            selectedAction={sidebarAction}
            setSelectedAction={setSidebarAction}
            selectedUser={sidebarUser}
            setSelectedUser={setSidebarUser}
            ipSearch={sidebarIp}
            setIpSearch={setSidebarIp}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onResetFilters={handleResetFilters}
            onApplyFilters={handleApplyFilters}
          />
        </div>
      </div>

      {/* ── 4. Export Logs Modal ── */}
      <ExportLogsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

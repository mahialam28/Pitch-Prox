"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  auditTabs,
  actionFilterOptions,
  entityFilterOptions,
  userFilterOptions,
  ipFilterOptions,
} from "../audit-logs-data";

export default function AuditTable({
  logs,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedAction,
  setSelectedAction,
  selectedEntity,
  setSelectedEntity,
  selectedUser,
  setSelectedUser,
  selectedIp,
  setSelectedIp,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalEvents = 1248,
  onOpenExportModal,
  // The right-side Filters panel is the main filter area; these duplicates are hidden by default
  showInlineFilters = false,
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'action' | 'entity' | 'user' | 'ip' | 'pageSize'
  const tableRef = useRef(null);

  // Click outside to close open dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const renderCategoryBadge = (category) => {
    const catLower = (category || "").toLowerCase();

    if (catLower.includes("security")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#10B981]">
          Security
        </span>
      );
    }
    if (catLower.includes("billing")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF3EB] text-[#F97316]">
          Billing
        </span>
      );
    }
    if (catLower.includes("user")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3E8FF] text-[#9333EA]">
          User Mgmt
        </span>
      );
    }
    if (catLower.includes("system")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#3B82F6]">
          System
        </span>
      );
    }
    if (catLower.includes("compliance")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E6F7F7] text-[#0EADAB]">
          Compliance
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">
        {category}
      </span>
    );
  };

  // Pagination calculation
  const totalPages = Math.ceil(logs.length / pageSize) || 1;
  const paginatedLogs = logs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startItem = logs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, logs.length);

  return (
    <div
      ref={tableRef}
      className="bg-white rounded-2xl border border-light-gray/80 shadow-xs flex flex-col overflow-hidden"
    >
      {/* ── 1. Top Tabs & Export Button ── */}
      <div className="px-5 pt-4 border-b border-light-gray/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto -mb-px">
          {auditTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`pb-3 px-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-medium-black hover:text-dark-black hover:border-light-gray"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Export Button */}
        <div className="pb-3 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black/85 hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── 2. Filter / Search Toolbar ── */}
      <div className="p-4 sm:p-5 border-b border-light-gray/70 flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search logs..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-light-gray text-xs font-normal text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        {showInlineFilters && (
        <>
        {/* All Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("action")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              selectedAction !== "All Actions"
                ? "border-primary text-primary bg-primary/5"
                : "border-light-gray text-dark-black/85 hover:bg-light-gray/40 bg-white"
            }`}
          >
            <span className="text-medium-black font-medium">{selectedAction}</span>
            <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
          </button>

          {openDropdown === "action" && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto">
              {actionFilterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedAction(opt);
                    setOpenDropdown(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    selectedAction === opt
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-medium-black hover:bg-light-gray/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Entities Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("entity")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              selectedEntity !== "All Entities"
                ? "border-primary text-primary bg-primary/5"
                : "border-light-gray text-dark-black/85 hover:bg-light-gray/40 bg-white"
            }`}
          >
            <span className="text-medium-black font-medium">{selectedEntity}</span>
            <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
          </button>

          {openDropdown === "entity" && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
              {entityFilterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedEntity(opt);
                    setOpenDropdown(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    selectedEntity === opt
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-medium-black hover:bg-light-gray/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Users Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("user")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              selectedUser !== "All Users"
                ? "border-primary text-primary bg-primary/5"
                : "border-light-gray text-dark-black/85 hover:bg-light-gray/40 bg-white"
            }`}
          >
            <span className="text-medium-black font-medium">{selectedUser}</span>
            <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
          </button>

          {openDropdown === "user" && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
              {userFilterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedUser(opt);
                    setOpenDropdown(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    selectedUser === opt
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-medium-black hover:bg-light-gray/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All IP Addresses Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("ip")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              selectedIp !== "All IP Addresses"
                ? "border-primary text-primary bg-primary/5"
                : "border-light-gray text-dark-black/85 hover:bg-light-gray/40 bg-white"
            }`}
          >
            <span className="text-medium-black font-medium">{selectedIp}</span>
            <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
          </button>

          {openDropdown === "ip" && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
              {ipFilterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedIp(opt);
                    setOpenDropdown(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    selectedIp === opt
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-medium-black hover:bg-light-gray/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>

      {/* ── 3. Table Section ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-[#FAFCFC]">
              <th className="py-3 px-4 font-semibold">Time</th>
              <th className="py-3 px-4 font-semibold">User</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Entity</th>
              <th className="py-3 px-4 font-semibold">Entity ID</th>
              <th className="py-3 px-4 font-semibold">IP Address</th>
              <th className="py-3 px-4 font-semibold">Details</th>
              <th className="py-3 px-4 font-semibold">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-light-black">
                  No audit log events found matching current criteria.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-light-gray/30 transition-colors"
                >
                  {/* Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-dark-black/90">
                        {log.time}
                      </span>
                      <span className="text-[11px] text-light-black font-normal">
                        {log.timeDetail}
                      </span>
                    </div>
                  </td>

                  {/* User */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-light-gray shrink-0">
                        <Image
                          src={log.user.avatar}
                          alt={log.user.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-dark-black/90 truncate">
                          {log.user.name}
                        </span>
                        <span className="text-[10px] text-light-black">
                          {log.user.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-dark-black/90">
                        {log.action}
                      </span>
                      {log.actionSub && (
                        <span className="text-[10px] text-light-black font-normal">
                          {log.actionSub}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Entity */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-medium-black">
                    {log.entity}
                  </td>

                  {/* Entity ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-dark-black/85 font-mono text-[11px]">
                    {log.entityId}
                  </td>

                  {/* IP Address */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-medium-black font-mono text-[11px]">
                    {log.ipAddress}
                  </td>

                  {/* Details */}
                  <td className="py-3.5 px-4 min-w-[180px] max-w-[240px]">
                    <span className="text-medium-black text-xs block truncate" title={log.details}>
                      {log.details}
                    </span>
                  </td>

                  {/* Category Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderCategoryBadge(log.category)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. Table Footer / Pagination ── */}
      <div className="p-4 border-t border-light-gray/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-medium-black">
        {/* Count string */}
        <div>
          Showing {startItem} to {endItem} of {totalEvents} events
        </div>

        {/* Pagination & Page Size */}
        <div className="flex items-center gap-3">
          {/* Page numbers */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-dark-black hover:bg-light-gray/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary text-white shadow-2xs"
                    : "border border-light-gray text-dark-black hover:bg-light-gray/50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <span className="px-1 text-light-black">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(125)}
              className="w-7 h-7 rounded-lg border border-light-gray text-xs font-semibold flex items-center justify-center text-dark-black hover:bg-light-gray/50 transition-colors cursor-pointer"
            >
              125
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-dark-black hover:bg-light-gray/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page size dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("pageSize")}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-dark-black rounded-lg border border-light-gray bg-white hover:bg-light-gray/40 transition-colors cursor-pointer shadow-2xs"
            >
              <span>{pageSize} / page</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>

            {openDropdown === "pageSize" && (
              <div className="absolute bottom-full right-0 mb-1 w-28 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
                {[10, 25, 50, 100].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      pageSize === size
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-medium-black hover:bg-light-gray/50"
                    }`}
                  >
                    {size} / page
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

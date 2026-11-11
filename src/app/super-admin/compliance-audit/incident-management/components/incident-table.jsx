"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Plus,
  Lock,
  UserX,
  CreditCard,
  Zap,
} from "lucide-react";
import Pagination from "@/components/shared/pagination/pagination";
import {
  severityFilterOptions,
  categoryFilterOptions,
  statusFilterOptions,
} from "../incident-data";

export default function IncidentTable({
  incidents,
  onOpenReportModal,
  searchTerm,
  setSearchTerm,
  selectedSeverity,
  setSelectedSeverity,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedOwner,
  setSelectedOwner,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  owners = [],
  canReport = true,
}) {
  const ownerFilterOptions = ["All Owners", ...owners.map((owner) => owner.name)];
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(null); // 'severity' | 'category' | 'status' | 'owner' | 'pageSize'

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const getCategoryIcon = (category) => {
    if (category === "Security Incident") {
      return <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
    }
    if (category === "Unauthorized Access") {
      return <UserX className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
    }
    return <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  };

  const renderSeverityBadge = (severity) => {
    if (severity === "Critical") {
      return (
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA] inline-flex items-center gap-1">
          Critical
        </span>
      );
    }
    if (severity === "High") {
      return (
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#FEF3EB] text-[#F97316] border border-[#FFEDD5] inline-flex items-center gap-1">
          <Zap className="w-3 h-3 fill-[#F97316]" /> High
        </span>
      );
    }
    if (severity === "Medium") {
      return (
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#FEF9C3] text-[#CA8A04] border border-[#FEF08A] inline-flex items-center gap-1">
          Medium
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] inline-flex items-center gap-1">
        Low
      </span>
    );
  };

  const renderStatusBadge = (status) => {
    if (status === "Investigating") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3E8FF] text-[#9333EA]">
          Investigating
        </span>
      );
    }
    if (status === "Closed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#E0F2FE] text-[#0284C7]">
          Closed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#10B981]">
        {status}
      </span>
    );
  };

  // Pagination calculation
  const totalPages = Math.ceil(incidents.length / pageSize) || 1;
  const paginatedIncidents = incidents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 shadow-xs flex flex-col overflow-hidden">
      {/* ── 1. Top Filters & Actions Bar ── */}
      <div className="p-4 sm:p-5 border-b border-light-gray/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input & Dropdown Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative min-w-[200px] sm:min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search incidents..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-light-gray text-xs font-medium text-dark-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("severity")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                selectedSeverity !== "All Severity"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-light-gray text-dark-black/80 hover:bg-light-gray/40 bg-white"
              }`}
            >
              <span>{selectedSeverity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
            </button>

            {openDropdown === "severity" && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
                {severityFilterOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedSeverity(opt);
                      setOpenDropdown(null);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      selectedSeverity === opt
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-dark-black/80 hover:bg-light-gray/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("category")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                selectedCategory !== "All Categories"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-light-gray text-dark-black/80 hover:bg-light-gray/40 bg-white"
              }`}
            >
              <span>{selectedCategory}</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
            </button>

            {openDropdown === "category" && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
                {categoryFilterOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(opt);
                      setOpenDropdown(null);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      selectedCategory === opt
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-dark-black/80 hover:bg-light-gray/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("status")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                selectedStatus !== "All Statuses"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-light-gray text-dark-black/80 hover:bg-light-gray/40 bg-white"
              }`}
            >
              <span>{selectedStatus}</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
            </button>

            {openDropdown === "status" && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
                {statusFilterOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(opt);
                      setOpenDropdown(null);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      selectedStatus === opt
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-dark-black/80 hover:bg-light-gray/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Owners Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("owner")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                selectedOwner !== "All Owners"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-light-gray text-dark-black/80 hover:bg-light-gray/40 bg-white"
              }`}
            >
              <span>{selectedOwner}</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
            </button>

            {openDropdown === "owner" && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
                {ownerFilterOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedOwner(opt);
                      setOpenDropdown(null);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      selectedOwner === opt
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-dark-black/80 hover:bg-light-gray/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button: + Report Incident */}
        {canReport && <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={onOpenReportModal}
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Report Incident</span>
          </button>
        </div>}
      </div>

      {/* ── 2. Table Section ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-[#FAFCFC]">
              <th className="py-3 px-4 font-semibold">ID</th>
              <th className="py-3 px-4 font-semibold">Title</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Severity</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Owner</th>
              <th className="py-3 px-4 font-semibold">Reported By</th>
              <th className="py-3 px-4 font-semibold">Reported At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {paginatedIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-light-black">
                  No incidents found matching current filters.
                </td>
              </tr>
            ) : (
              paginatedIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => {
                    router.push(
                      `/super-admin/compliance-audit/incident-management/${incident.id}`
                    );
                  }}
                  className="hover:bg-light-gray/30 transition-colors cursor-pointer group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                    <Link
                      href={`/super-admin/compliance-audit/incident-management/${incident.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary hover:underline font-semibold"
                    >
                      {incident.reference}
                    </Link>
                  </td>

                  {/* Title & Subtitle */}
                  <td className="py-3.5 px-4 min-w-[200px]">
                    <Link
                      href={`/super-admin/compliance-audit/incident-management/${incident.id}`}
                      className="flex flex-col group/link"
                    >
                      <span className="font-semibold text-dark-black group-hover/link:text-primary transition-colors">
                        {incident.title}
                      </span>
                      {incident.relatedTicket && (
                        <span className="text-[11px] text-light-black">
                          From ticket {incident.relatedTicket.reference}
                        </span>
                      )}
                    </Link>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-dark-black/85">
                      {getCategoryIcon(incident.category)}
                      <span>{incident.category}</span>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderSeverityBadge(incident.severity)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(incident.status)}
                  </td>

                  {/* Owner (Assigned To) */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-dark-black/85">
                    {incident.assignedTo?.name ?? <span className="text-light-black font-normal">Unassigned</span>}
                  </td>

                  {/* Reported By */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {incident.reportedBy.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-dark-black/85">
                        {incident.reportedBy.name}
                      </span>
                    </div>
                  </td>

                  {/* Reported At */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col text-[11px]">
                      <span className="font-medium text-dark-black/85">
                        {new Date(incident.reportedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-light-black">
                        {new Date(incident.reportedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── 3. Paging ── */}
      <div className="p-4 border-t border-light-gray/70">
        <Pagination
          currentPage={Math.min(currentPage, totalPages)}
          totalItems={incidents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemLabel="incidents"
        />
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Plus,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  accessTabs,
  roleFilterOptions,
  statusFilterOptions,
  mfaFilterOptions,
} from "../access-records-data";

export default function AccessTable({
  users,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  selectedMfa,
  setSelectedMfa,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalUsers = 0,
  totalPages = 1,
  loading = false,
  canWrite = true,
  rowActions,
  onOpenAddUserModal,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null); // 'role' | 'status' | 'mfa' | 'pageSize'
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Badge colour per role; the text is always the role's real name
  const ROLE_BADGES = {
    "Super Admin": "bg-[#F3E8FF] text-[#9333EA]",
    "Admin Manager": "bg-[#EFF6FF] text-[#3B82F6]",
    Support: "bg-[#E6F7F7] text-[#0EADAB]",
    Auditor: "bg-[#FEF3EB] text-[#F97316]",
    "Internal Sales Rep": "bg-[#FDF2F8] text-[#DB2777]",
  };
  const renderRoleBadge = (role) => (
    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${ROLE_BADGES[role] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>{role}</span>
  );

  // Paging happens on the server: `users` is already the current page
  const paginatedUsers = users;
  const startItem = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min((currentPage - 1) * pageSize + users.length, totalUsers);
  // Up to 5 page buttons around the current page
  const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index);
  const formatLogin = (value) => {
    if (!value) return { date: "Never", time: "" };
    const date = new Date(value);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };
  const STATUS_STYLES = {
    Active: "text-emerald-600 bg-emerald-500",
    Onboarding: "text-blue-600 bg-blue-500",
    Pending: "text-amber-600 bg-amber-500",
    Offboarding: "text-orange-600 bg-orange-500",
    Expired: "text-light-black bg-light-black",
    Deactivated: "text-red-600 bg-red-500",
  };

  return (
    <div
      ref={tableRef}
      className="bg-white rounded-2xl border border-light-gray/80 shadow-xs flex flex-col overflow-hidden"
    >
      {/* ── 1. Top Tabs & Add Employee Action ── */}
      <div className="px-5 pt-4 border-b border-light-gray/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto -mb-px">
          {accessTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`pb-3 px-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
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

        {/* Add Employee Button */}
        <div className={`pb-3 shrink-0 self-end sm:self-auto ${canWrite ? "" : "hidden"}`}>
          <button
            type="button"
            onClick={onOpenAddUserModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* ── 2. Filter / Search Toolbar ── */}
      <div className="p-4 sm:p-5 border-b border-light-gray/70 flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, or username..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-light-gray text-xs font-normal text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        {/* All Roles Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("role")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              selectedRole !== "All Roles"
                ? "border-primary text-primary bg-primary/5"
                : "border-light-gray text-dark-black/85 hover:bg-light-gray/40 bg-white"
            }`}
          >
            <span className="text-medium-black font-medium">{selectedRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
          </button>

          {openDropdown === "role" && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto">
              {roleFilterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedRole(opt);
                    setOpenDropdown(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    selectedRole === opt
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

        {/* All Statuses Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("status")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              selectedStatus !== "All Statuses"
                ? "border-primary text-primary bg-primary/5"
                : "border-light-gray text-dark-black/85 hover:bg-light-gray/40 bg-white"
            }`}
          >
            <span className="text-medium-black font-medium">{selectedStatus}</span>
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
                      : "text-medium-black hover:bg-light-gray/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All MFA Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("mfa")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              selectedMfa !== "All MFA Statuses"
                ? "border-primary text-primary bg-primary/5"
                : "border-light-gray text-dark-black/85 hover:bg-light-gray/40 bg-white"
            }`}
          >
            <span className="text-medium-black font-medium">{selectedMfa}</span>
            <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0" />
          </button>

          {openDropdown === "mfa" && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
              {mfaFilterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedMfa(opt);
                    setOpenDropdown(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    selectedMfa === opt
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
      </div>

      {/* ── 3. Table Section ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-[#FAFCFC]">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    users.length > 0 && selectedIds.length === users.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-light-gray text-primary focus:ring-primary/20 accent-primary"
                />
              </th>
              <th className="py-3 px-4 font-semibold">USER</th>
              <th className="py-3 px-4 font-semibold">ROLE</th>
              <th className="py-3 px-4 font-semibold">STATUS</th>
              <th className="py-3 px-4 font-semibold">MFA</th>
              <th className="py-3 px-4 font-semibold">LAST LOGIN</th>
              {rowActions && <th className="py-3 px-4 w-10"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-light-black">
                  {loading ? "Loading employees…" : "No access records found matching current criteria."}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const isChecked = selectedIds.includes(u.id);

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-light-gray/30 transition-colors"
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(u.id)}
                        className="rounded border-light-gray text-primary focus:ring-primary/20 accent-primary"
                      />
                    </td>

                    {/* USER (Avatar/Initials + Name & Email) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {u.avatar ? (
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-light-gray shrink-0">
                            <Image
                              src={u.avatar}
                              alt={u.name}
                              width={28}
                              height={28}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              u.initialsBg || "bg-primary/10 text-primary"
                            }`}
                          >
                            {u.initials}
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-dark-black/90 truncate">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-light-black truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderRoleBadge(u.roleLabel ?? u.role)}
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(() => {
                        const label = u.statusLabel ?? u.status;
                        const [text, dot] = (STATUS_STYLES[label] ?? STATUS_STYLES.Expired).split(" ");
                        return (
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                            <span>{label}</span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* MFA */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {u.mfa === "Enabled" ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Enabled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
                          <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Disabled</span>
                        </div>
                      )}
                    </td>

                    {/* LAST LOGIN */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col text-[11px]">
                        <span className="font-medium text-dark-black/85">
                          {formatLogin(u.lastLoginAt).date}
                        </span>
                        <span className="text-light-black">
                          {formatLogin(u.lastLoginAt).time}
                        </span>
                      </div>
                    </td>
                    {rowActions && <td className="py-3.5 px-4 text-right">{rowActions(u)}</td>}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. Table Footer / Pagination ── */}
      <div className="p-4 border-t border-light-gray/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-medium-black">
        {/* Count string */}
        <div>
          Showing {startItem} to {endItem} of {totalUsers} users
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

            {pageNumbers.map((pageNum) => (
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
                {[10, 20, 50, 100].map((size) => (
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

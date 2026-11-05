"use client";

import { EVIDENCE_STATUSES, SOC2_CONTROLS, TRUST_SERVICE_CRITERIA, controlsLabel, controlsOf, criteriaOf } from "../evidence-options";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  Upload,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Check,
  ChevronDown,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { initialEvidenceItems } from "../evidence-data";

const tabsList = [
  "All Evidence",
  "By Control",
  "By Trust Service Criteria",
  "By Owner",
  "Expiring Soon",
  "Recently Added",
  "Archived",
];

const controlFilterOptions = [{ value: "All Controls", label: "All Controls" }, ...SOC2_CONTROLS.map((control) => ({ value: control.id, label: control.id }))];

const criteriaFilterOptions = [{ value: "All Trust Service Criteria", label: "All Trust Service Criteria" }, ...TRUST_SERVICE_CRITERIA.map((value) => ({ value, label: value }))];

const ownerFilterOptions = [
  { value: "All Owners", label: "All Owners" },
  { value: "Sarah Johnson", label: "Sarah Johnson" },
  { value: "Mike Davis", label: "Mike Davis" },
  { value: "Daniel Miller", label: "Daniel Miller" },
];

const statusFilterOptions = [{ value: "All Statuses", label: "All Statuses" }, ...EVIDENCE_STATUSES.map((value) => ({ value, label: value }))];

const pageSizeOptions = [
  { value: "10 / page", label: "10 / page" },
  { value: "20 / page", label: "20 / page" },
  { value: "50 / page", label: "50 / page" },
];

export default function EvidenceRepositoryTable({
  onOpenUploadModal,
  evidenceList: initialList = initialEvidenceItems,
  onSelectEvidence,
}) {
  const [activeTab, setActiveTab] = useState("All Evidence");
  const [evidenceList, setEvidenceList] = useState(initialList);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedControl, setSelectedControl] = useState("All Controls");
  const [selectedCriteria, setSelectedCriteria] = useState("All Trust Service Criteria");
  const [selectedOwner, setSelectedOwner] = useState("All Owners");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Follow the page's list when it changes (adjusted during render, not in an effect)
  const [shownList, setShownList] = useState(initialList);
  if (shownList !== initialList) {
    setShownList(initialList);
    setEvidenceList(initialList);
  }

  // Filter evidence
  const filteredEvidence = evidenceList.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      controlsOf(item).some((control) => control.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.owner.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesControl =
      selectedControl === "All Controls" || controlsOf(item).includes(selectedControl);

    const matchesCriteria =
      selectedCriteria === "All Trust Service Criteria" ||
      criteriaOf(item).includes(selectedCriteria);

    const matchesOwner =
      selectedOwner === "All Owners" || item.owner.name === selectedOwner;

    const matchesStatus =
      selectedStatus === "All Statuses" || item.status === selectedStatus;

    const matchesTab =
      (activeTab === "All Evidence" && item.status !== "Archived") ||
      (activeTab === "Expiring Soon" && item.expiryDate.daysRemaining.includes("365")) ||
      (activeTab === "Recently Added" && item.lastUpdated.date.includes("May 19")) ||
      // Archived evidence stays in the audit history, under its own tab
      (activeTab === "Archived" ? item.status === "Archived" : item.status !== "Archived");

    return (
      matchesSearch &&
      matchesControl &&
      matchesCriteria &&
      matchesOwner &&
      matchesStatus &&
      matchesTab
    );
  });

  const totalItems = 248; // Matching the screenshot's 248 total
  const totalPages = 31; // Matching the pagination screenshot

  const handleSelectAll = () => {
    if (selectedItems.length === filteredEvidence.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredEvidence.map((i) => i.id));
    }
  };

  const handleToggleItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ── Tabs Bar + Upload Action Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-light-gray/70 pb-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar py-1">
          {tabsList.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`relative pb-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-light-black hover:text-dark-black/80"
                }`}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={onOpenUploadModal}
          className="bg-primary hover:bg-[#0c9593] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Evidence</span>
        </button>
      </div>

      {/* ── Table Card Container ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-light-gray shadow-xs p-5 sm:p-6 space-y-5">
        {/* Filter Controls Row */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search evidence by name or keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-light-gray text-xs text-dark-black/85 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>

          {/* 4 Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full xl:w-auto">
            {/* All Controls */}
            <div className="w-full min-w-[125px]">
              <Dropdown
                label="All Controls"
                items={controlFilterOptions}
                selected={selectedControl}
                onSelect={(val) => {
                  setSelectedControl(val);
                  setCurrentPage(1);
                }}
                variant="sm"
                className="w-full"
              />
            </div>

            {/* All Criteria */}
            <div className="w-full min-w-[120px]">
              <Dropdown
                label="All Trust Service Criteria"
                items={criteriaFilterOptions}
                selected={selectedCriteria}
                onSelect={(val) => {
                  setSelectedCriteria(val);
                  setCurrentPage(1);
                }}
                variant="sm"
                className="w-full"
              />
            </div>

            {/* All Owners */}
            <div className="w-full min-w-[120px]">
              <Dropdown
                label="All Owners"
                items={ownerFilterOptions}
                selected={selectedOwner}
                onSelect={(val) => {
                  setSelectedOwner(val);
                  setCurrentPage(1);
                }}
                variant="sm"
                className="w-full"
              />
            </div>

            {/* All Status */}
            <div className="w-full min-w-[115px]">
              <Dropdown
                label="All Statuses"
                items={statusFilterOptions}
                selected={selectedStatus}
                onSelect={(val) => {
                  setSelectedStatus(val);
                  setCurrentPage(1);
                }}
                variant="sm"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* ── Evidence Data Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left border-collapse">
            <thead>
              <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider">
                <th className="py-3 px-3 w-10">
                  <div
                    onClick={handleSelectAll}
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer ${
                      selectedItems.length === filteredEvidence.length &&
                      filteredEvidence.length > 0
                        ? "bg-primary border-primary text-white"
                        : "border-[#D1D5DB] bg-white"
                    }`}
                  >
                    {selectedItems.length === filteredEvidence.length &&
                      filteredEvidence.length > 0 && (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                  </div>
                </th>
                <th className="py-3 px-3">Evidence Name</th>
                <th className="py-3 px-3">Associated Controls</th>
                <th className="py-3 px-3">Trust Service Criteria</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Updated</th>
                <th className="py-3 px-3">Evidence Expiration</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-light-gray/60">
              {filteredEvidence.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectEvidence?.(item)}
                    className={`group hover:bg-[#F8FAFA] transition-colors cursor-pointer ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td className="py-3.5 px-3">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleItem(item.id);
                        }}
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "border-[#D1D5DB] bg-white group-hover:border-primary/60"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </td>

                    {/* Evidence Name Column with Icon & Subtitle */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.fileType === "pdf"
                              ? "bg-red-50 text-red-500"
                              : item.fileType === "xlsx"
                              ? "bg-emerald-50 text-emerald-500"
                              : "bg-blue-50 text-blue-500"
                          }`}
                        >
                          {item.fileType === "xlsx" ? (
                            <FileSpreadsheet className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-light-black truncate max-w-[220px]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Associated Controls Column ("CC6.1 +2 more") */}
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-medium text-dark-black/75 whitespace-nowrap" title={controlsOf(item).join(", ")}>
                        {controlsLabel(item)}
                      </span>
                    </td>

                    {/* Trust Criteria Column */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4F2] text-[#0D9488]">
                        {criteriaOf(item).length > 1 ? `${criteriaOf(item)[0]} +${criteriaOf(item).length - 1}` : criteriaOf(item)[0] ?? "—"}
                      </span>
                    </td>

                    {/* Owner Column */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.owner.avatar}
                          alt={item.owner.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-light-gray"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-dark-black/80 truncate">
                            {item.owner.name}
                          </p>
                          <p className="text-[10px] text-light-black truncate">
                            {item.owner.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          ({
                            Verified: "bg-[#E6F7F7] text-[#0EADAB]",
                            "Under Review": "bg-[#EFF6FF] text-[#2563EB]",
                            Draft: "bg-light-gray text-medium-black",
                            "Needs Changes": "bg-amber-50 text-amber-600",
                            Expired: "bg-red-50 text-red-600",
                            Archived: "bg-slate-100 text-slate-500",
                          })[item.status] ?? "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Last Updated Column */}
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-medium text-dark-black/75">
                        {item.lastUpdated.date}
                      </p>
                      <p className="text-[10px] text-light-black">
                        {item.lastUpdated.time}
                      </p>
                    </td>

                    {/* Expiry Date Column */}
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-medium text-dark-black/75">
                        {item.expiryDate.date}
                      </p>
                      <p className="text-[10px] text-light-black">
                        ({item.expiryDate.daysRemaining})
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer / Pagination Controls ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-light-gray/70">
          {/* Showing counter */}
          <span className="text-xs text-light-black font-medium">
            Showing 1 to {filteredEvidence.length} of {totalItems} evidence items
          </span>

          {/* Right Pagination & Page Size */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 1
                    ? "bg-primary text-white font-bold"
                    : "text-dark-black/80 hover:bg-light-gray/50"
                }`}
              >
                1
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 2
                    ? "bg-primary text-white font-bold"
                    : "text-dark-black/80 hover:bg-light-gray/50"
                }`}
              >
                2
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 3
                    ? "bg-primary text-white font-bold"
                    : "text-dark-black/80 hover:bg-light-gray/50"
                }`}
              >
                3
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(4)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 4
                    ? "bg-primary text-white font-bold"
                    : "text-dark-black/80 hover:bg-light-gray/50"
                }`}
              >
                4
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(5)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 5
                    ? "bg-primary text-white font-bold"
                    : "text-dark-black/80 hover:bg-light-gray/50"
                }`}
              >
                5
              </button>

              <span className="px-1 text-light-black">...</span>

              <button
                type="button"
                onClick={() => setCurrentPage(31)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === 31
                    ? "bg-primary text-white font-bold"
                    : "text-dark-black/80 hover:bg-light-gray/50"
                }`}
              >
                31
              </button>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Page size dropdown */}
            <div className="w-24">
              <Dropdown
                label="10 / page"
                items={pageSizeOptions}
                selected={`${pageSize} / page`}
                onSelect={(val) => {
                  const num = parseInt(val);
                  if (num) setPageSize(num);
                }}
                variant="sm"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

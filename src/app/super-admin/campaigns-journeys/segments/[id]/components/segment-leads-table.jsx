"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Check,
  UserPlus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Flame,
  UserX,
  Star,
  Slash,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { INITIAL_LEADS } from "../../../segments-data";

const LEAD_TYPE_OPTIONS = [
  { value: "all", label: "Lead Type" },
  { value: "Expired Listing", label: "Expired Listing" },
  { value: "FSBO", label: "FSBO" },
  { value: "Pre-Expired", label: "Pre-Expired" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Status" },
  { value: "Hot Lead", label: "Hot Lead" },
  { value: "Not Connected", label: "Not Connected" },
  { value: "Interested", label: "Interested" },
  { value: "Not Interested", label: "Not Interested" },
];

const LAST_CONNECTED_OPTIONS = [
  { value: "all", label: "Last Connected" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
];

const PAGE_SIZE_OPTIONS = [
  { value: "8", label: "8 / page" },
  { value: "10", label: "10 / page" },
  { value: "16", label: "16 / page" },
];

export default function SegmentLeadsTable({
  segmentName = "Hot Leads",
  totalLeadsCount = 842,
  onAddLeadsClick,
}) {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [selectedLeadIds, setSelectedLeadIds] = useState([
    "lead-1",
    "lead-3",
    "lead-5",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadType, setSelectedLeadType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLastConnected, setSelectedLastConnected] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const handleToggleSelectLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedLeadIds([]);
  };

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.leadType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedLeadType === "all" || lead.leadType === selectedLeadType;

      const matchesStatus =
        selectedStatus === "all" || lead.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leads, searchQuery, selectedLeadType, selectedStatus]);

  // Pagination calculation
  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const isAllCurrentSelected =
    currentLeads.length > 0 &&
    currentLeads.every((lead) => selectedLeadIds.includes(lead.id));

  const handleToggleSelectAllCurrent = () => {
    if (isAllCurrentSelected) {
      currentLeads.forEach((l) => {
        if (selectedLeadIds.includes(l.id)) {
          handleToggleSelectLead(l.id);
        }
      });
    } else {
      currentLeads.forEach((l) => {
        if (!selectedLeadIds.includes(l.id)) {
          handleToggleSelectLead(l.id);
        }
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Hot Lead":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
            <span>Hot Lead</span>
          </span>
        );
      case "Interested":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Star className="w-3 h-3 text-blue-500 fill-blue-500" />
            <span>Interested</span>
          </span>
        );
      case "Not Interested":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-pink-50 text-pink-600 border border-pink-200">
            <Slash className="w-3 h-3 text-pink-500" />
            <span>Not Interested</span>
          </span>
        );
      case "Not Connected":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
            <UserX className="w-3 h-3 text-slate-500" />
            <span>Not Connected</span>
          </span>
        );
    }
  };

  const getOutcomeBadge = (outcome) => {
    if (outcome === "Appointment Set") {
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
          Appointment Set
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap">
        Follow Up
      </span>
    );
  };

  const getSegmentTag = (segment) => {
    if (!segment) {
      return <span className="text-light-black font-semibold">—</span>;
    }
    if (segment === "Hot Leads") {
      return (
        <span className="text-[11px] font-bold text-orange-500 bg-orange-50/70 border border-orange-200/80 px-2.5 py-0.5 rounded-md whitespace-nowrap">
          Hot Leads
        </span>
      );
    }
    if (segment === "Follow-Up") {
      return (
        <span className="text-[11px] font-bold text-blue-600 bg-blue-50/70 border border-blue-200/80 px-2.5 py-0.5 rounded-md whitespace-nowrap">
          Follow-Up
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-purple-600 bg-purple-50/70 border border-purple-200/80 px-2.5 py-0.5 rounded-md whitespace-nowrap">
        {segment}
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Title, Subtitle, and Add Leads Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
            Leads in this Segment
          </h3>
          <p className="text-xs text-light-black">
            Manage the leads currently included in {segmentName}.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={onAddLeadsClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Add Leads</span>
          </button>
          <span className="text-xs text-light-black font-semibold whitespace-nowrap">
            {totalLeadsCount} total leads
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-black" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-2xs"
            />
          </div>

          {/* Lead Type Dropdown */}
          <div className="min-w-[125px]">
            <Dropdown
              items={LEAD_TYPE_OPTIONS}
              selected={selectedLeadType}
              onSelect={(val) => {
                setSelectedLeadType(val);
                setCurrentPage(1);
              }}
              variant="small"
              className="w-full"
              buttonClassName="w-full justify-between"
            />
          </div>

          {/* Status Dropdown */}
          <div className="min-w-[115px]">
            <Dropdown
              items={STATUS_OPTIONS}
              selected={selectedStatus}
              onSelect={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              variant="small"
              className="w-full"
              buttonClassName="w-full justify-between"
            />
          </div>

          {/* Last Connected Dropdown */}
          <div className="min-w-[140px]">
            <Dropdown
              items={LAST_CONNECTED_OPTIONS}
              selected={selectedLastConnected}
              onSelect={(val) => {
                setSelectedLastConnected(val);
                setCurrentPage(1);
              }}
              variant="small"
              className="w-full"
              buttonClassName="w-full justify-between"
            />
          </div>
        </div>

        {/* Selected Counter */}
        <span className="text-xs font-semibold text-dark-black/80 whitespace-nowrap ml-auto lg:ml-0">
          {selectedLeadIds.length} leads selected
        </span>
      </div>

      {/* Floating Action Banner When Leads are Selected */}
      {selectedLeadIds.length > 0 && (
        <div className="w-full bg-[#EEFDFC] border border-[#C6F5F2] rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs sm:text-[13px] font-bold text-dark-black">
              {selectedLeadIds.length} leads selected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-4 py-2 bg-white border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/85 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Clear Selection
            </button>
            <span className="text-xs font-semibold text-dark-black/80 hidden sm:inline-block">
              {selectedLeadIds.length} leads selected
            </span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider whitespace-nowrap bg-slate-50/40">
                <th className="py-3.5 pl-4 pr-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleToggleSelectAllCurrent}
                    className="w-4 h-4 rounded border-light-gray text-primary focus:ring-primary/20 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 text-left">LEAD NAME</th>
                <th className="py-3.5 px-3 text-left">COMPANY</th>
                <th className="py-3.5 px-3 text-left">STATUS</th>
                <th className="py-3.5 px-3 text-left">LEAD TYPE</th>
                <th className="py-3.5 px-3 text-left">OUTCOME</th>
                <th className="py-3.5 px-3 text-left">LAST CONNECTED</th>
                <th className="py-3.5 px-3 text-left">SEGMENT</th>
                <th className="py-3.5 pr-4 pl-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {currentLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-light-gray/25 transition-colors ${
                      isSelected ? "bg-[#EEFDFC]/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectLead(lead.id)}
                        className="w-4 h-4 rounded border-light-gray text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </td>

                    {/* Lead Name + Avatar */}
                    <td className="py-3 px-3 text-left">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${lead.avatarBg} text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {lead.avatar}
                        </div>
                        <span className="font-semibold text-dark-black/90 text-xs whitespace-nowrap">
                          {lead.name}
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3 px-3 text-left text-medium-black text-xs whitespace-nowrap">
                      {lead.company}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-left whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Lead Type */}
                    <td className="py-3 px-3 text-left text-medium-black text-xs whitespace-nowrap">
                      {lead.leadType}
                    </td>

                    {/* Outcome */}
                    <td className="py-3 px-3 text-left whitespace-nowrap">
                      {getOutcomeBadge(lead.outcome)}
                    </td>

                    {/* Last Connected */}
                    <td className="py-3 px-3 text-left whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs text-dark-black/85 font-medium">
                          {lead.lastConnected}
                        </span>
                        <span className="text-[10px] text-light-black font-normal">
                          {lead.lastConnectedTime}
                        </span>
                      </div>
                    </td>

                    {/* Segment Tag */}
                    <td className="py-3 px-3 text-left whitespace-nowrap">
                      {getSegmentTag(lead.segment)}
                    </td>

                    {/* Three-dots menu */}
                    <td className="py-3 pr-4 pl-2 text-right">
                      <button
                        type="button"
                        className="p-1 rounded-lg hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-light-gray/80 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <span className="text-xs text-light-black font-normal">
            Showing {startIndex + 1} to {endIndex} of {totalItems} leads
          </span>

          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-medium-black hover:text-dark-black hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer bg-white shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary text-white shadow-2xs"
                    : "border border-light-gray text-medium-black hover:text-dark-black hover:border-slate-300 bg-white shadow-2xs"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-medium-black hover:text-dark-black hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer bg-white shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Page size */}
            <div className="min-w-[105px] ml-1">
              <Dropdown
                items={PAGE_SIZE_OPTIONS}
                selected={String(pageSize)}
                onSelect={(v) => {
                  setPageSize(Number(v) || 8);
                  setCurrentPage(1);
                }}
                variant="small"
                className="w-full"
                buttonClassName="w-full justify-between"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

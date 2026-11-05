"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

export const initialPlaybooksData = [
  {
    id: "pb-1",
    name: "FSBO Mastery Playbook",
    subtitle: "Advanced FSBO conversation strategies",
    price: "49.00",
    status: "Active",
    sales: 124,
    revenue: "$6,076",
    lastUpdated: "May 15, 2025",
    leadType: "FSBO",
    control: "System",
  },
  {
    id: "pb-2",
    name: "Expired Listings Expert",
    subtitle: "Win expired listings with confidence",
    price: "49.00",
    status: "Active",
    sales: 98,
    revenue: "$4,802",
    lastUpdated: "May 12, 2025",
    leadType: "Expired",
    control: "System",
  },
  {
    id: "pb-3",
    name: "Absentee Owner Blueprint",
    subtitle: "Connect and convert absentee owners",
    price: "39.00",
    status: "Draft",
    sales: 0,
    revenue: "$0",
    lastUpdated: "May 10, 2025",
    leadType: "Absentee",
    control: "Custom",
  },
  {
    id: "pb-4",
    name: "Probate Specialist Tactics",
    subtitle: "Empathetic negotiation with estate executors",
    price: "59.00",
    status: "Active",
    sales: 76,
    revenue: "$4,484",
    lastUpdated: "May 08, 2025",
    leadType: "Probate",
    control: "System",
  },
  {
    id: "pb-5",
    name: "Pre-Foreclosure Authority",
    subtitle: "Urgent distress property conversation framework",
    price: "49.00",
    status: "Active",
    sales: 61,
    revenue: "$2,989",
    lastUpdated: "May 05, 2025",
    leadType: "Pre-Foreclosure",
    control: "Custom",
  },
  {
    id: "pb-6",
    name: "High-Net-Worth Luxury Pitch",
    subtitle: "Bespoke strategies for luxury listings $2M+",
    price: "79.00",
    status: "Active",
    sales: 42,
    revenue: "$3,318",
    lastUpdated: "May 01, 2025",
    leadType: "Luxury",
    control: "Team",
  },
  {
    id: "pb-7",
    name: "Past Client Re-Engagement",
    subtitle: "Generate referrals from past buyer & seller databases",
    price: "29.00",
    status: "Active",
    sales: 110,
    revenue: "$3,190",
    lastUpdated: "Apr 28, 2025",
    leadType: "Past Clients",
    control: "System",
  },
  {
    id: "pb-8",
    name: "Commercial Lease Negotiation",
    subtitle: "Multi-tenant office and retail closing scripts",
    price: "69.00",
    status: "Draft",
    sales: 0,
    revenue: "$0",
    lastUpdated: "Apr 25, 2025",
    leadType: "Commercial",
    control: "Custom",
  },
];

export const PlaybookManagementTable = ({
  playbooks = initialPlaybooksData,
  onAddNewPlaybook,
  onEditPlaybook,
  onDeletePlaybook,
  onPriceChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [controlsFilter, setControlsFilter] = useState("All Controls");
  const [leadTypeFilter, setLeadTypeFilter] = useState("All leads type");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  // Dropdown states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isLeadTypeOpen, setIsLeadTypeOpen] = useState(false);

  // Filter logic
  const filteredPlaybooks = playbooks.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || item.status === statusFilter;
    const matchesControls =
      controlsFilter === "All Controls" || item.control === controlsFilter;
    const matchesLeadType =
      leadTypeFilter === "All leads type" || item.leadType === leadTypeFilter;
    return matchesSearch && matchesStatus && matchesControls && matchesLeadType;
  });

  const totalItems = 248; // Matches Figma display
  const totalPages = Math.ceil(filteredPlaybooks.length / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredPlaybooks.length);
  const currentPlaybooks = filteredPlaybooks.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setControlsFilter("All Controls");
    setLeadTypeFilter("All leads type");
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden flex flex-col gap-4 p-5 sm:p-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-dark-black/85 font-secondary tracking-tight">
          Playbook Management
        </h2>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search playbooks..."
              className="w-full text-xs font-medium pl-9 pr-3.5 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-light-gray rounded-xl text-xs font-medium text-dark-black/80 hover:bg-light-gray/30 bg-white transition-colors cursor-pointer"
            >
              <span>{statusFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>

            {isStatusOpen && (
              <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs">
                {["All Status", "Active", "Draft", "Archived"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setIsStatusOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === st
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-dark-black/70 hover:bg-light-gray"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-light-gray rounded-xl text-xs font-medium text-dark-black/80 hover:bg-light-gray/30 bg-white transition-colors cursor-pointer"
            >
              <span>{controlsFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>

            {isControlsOpen && (
              <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs">
                {["All Controls", "System", "Custom", "Team"].map((ctrl) => (
                  <button
                    key={ctrl}
                    type="button"
                    onClick={() => {
                      setControlsFilter(ctrl);
                      setIsControlsOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      controlsFilter === ctrl
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-dark-black/70 hover:bg-light-gray"
                    }`}
                  >
                    {ctrl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Leads Type Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLeadTypeOpen(!isLeadTypeOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-light-gray rounded-xl text-xs font-medium text-dark-black/80 hover:bg-light-gray/30 bg-white transition-colors cursor-pointer"
            >
              <span>{leadTypeFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>

            {isLeadTypeOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs">
                {[
                  "All leads type",
                  "FSBO",
                  "Expired",
                  "Absentee",
                  "Probate",
                  "Pre-Foreclosure",
                  "Luxury",
                  "Past Clients",
                  "Commercial",
                ].map((lt) => (
                  <button
                    key={lt}
                    type="button"
                    onClick={() => {
                      setLeadTypeFilter(lt);
                      setIsLeadTypeOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      leadTypeFilter === lt
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-dark-black/70 hover:bg-light-gray"
                    }`}
                  >
                    {lt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-medium-black hover:text-dark-black hover:bg-light-gray/50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Add Playbook Button */}
        <Link
          href="/super-admin/playbook"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Playbook</span>
        </Link>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border border-light-gray/80 rounded-xl">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead className="bg-[#F8FAFC]">
            <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider">
              <th className="py-3.5 pl-4 sm:pl-5 pr-4 font-semibold">PLAYBOOK NAME</th>
              <th className="py-3.5 px-3 font-semibold">PRICE (USD)</th>
              <th className="py-3.5 px-3 font-semibold">STATUS</th>
              <th className="py-3.5 px-3 font-semibold">SALES</th>
              <th className="py-3.5 px-3 font-semibold">REVENUE</th>
              <th className="py-3.5 px-3 font-semibold">LAST UPDATED</th>
              <th className="py-3.5 pr-4 sm:pr-5 pl-3 font-semibold text-right">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {currentPlaybooks.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-primary/5 transition-colors group"
              >
                {/* Playbook Name with Icon */}
                <td className="py-3.5 pl-4 sm:pl-5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 shadow-2xs">
                      <Layers className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-dark-black/85 text-xs sm:text-sm group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-light-black font-medium truncate mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Price Input Field */}
                <td className="py-3.5 px-3">
                  <div className="relative flex items-center w-28">
                    <span className="absolute left-2.5 text-xs font-medium text-medium-black">
                      $
                    </span>
                    <input
                      type="text"
                      defaultValue={item.price}
                      onBlur={(e) => {
                        if (onPriceChange) onPriceChange(item.id, e.target.value);
                        toast.success(`Price updated to $${e.target.value}`);
                      }}
                      className="w-full text-xs font-semibold pl-6 pr-2.5 py-1.5 rounded-lg border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold leading-tight ${
                      item.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Sales */}
                <td className="py-3.5 px-3 font-semibold text-dark-black/80">
                  {item.sales}
                </td>

                {/* Revenue */}
                <td className="py-3.5 px-3 font-bold text-dark-black/85">
                  {item.revenue}
                </td>

                {/* Last Updated */}
                <td className="py-3.5 px-3 text-medium-black font-medium">
                  {item.lastUpdated}
                </td>

                {/* Actions */}
                <td className="py-3.5 pr-4 sm:pr-5 pl-3 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-light-black">
                    <Link
                      href="/super-admin/playbook"
                      className="p-1 rounded-md hover:text-primary hover:bg-light-gray/60 transition-colors cursor-pointer"
                      title="Edit Playbook"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDeletePlaybook(item.id, item.name)}
                      className="p-1 rounded-md hover:text-red hover:bg-red/10 transition-colors cursor-pointer"
                      title="Delete Playbook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-light-black">
        {/* Count text */}
        <span className="font-medium">
          Showing 1 to {currentPlaybooks.length} of {totalItems} evidence items
        </span>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3, 4, 5].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-6 h-6 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  safePage === pageNum
                    ? "bg-primary text-white"
                    : "hover:bg-light-gray text-medium-black"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <span className="text-light-black px-1">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(31)}
              className="w-6 h-6 rounded-lg text-xs font-semibold flex items-center justify-center hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
            >
              31
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rows Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-light-gray rounded-lg text-xs font-medium text-dark-black/80 hover:bg-light-gray/30 transition-colors cursor-pointer"
            >
              <span>{pageSize} / page</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>

            {isPageSizeOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-28 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs">
                {[10, 20, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                      setIsPageSizeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      pageSize === size
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-dark-black/70 hover:bg-light-gray"
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
};

export default PlaybookManagementTable;

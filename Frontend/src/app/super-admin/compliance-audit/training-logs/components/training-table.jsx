"use client";

import { departmentFilterOptions, statusFilterOptions } from "../training-options";

import React from "react";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";

export default function TrainingTable({
  logs = [],
  onCreateTraining,
  searchTerm = "",
  setSearchTerm,
  selectedStatus = "All",
  setSelectedStatus,
  selectedDepartment = "All",
  setSelectedDepartment,
  selectedType = "All",
  setSelectedType,
  currentPage = 1,
  setCurrentPage,
  pageSize = 10,
  setPageSize,
  totalItems = 256,
}) {
  const statusOptions = statusFilterOptions;
  const departmentOptions = departmentFilterOptions;

  const typeOptions = [
    { value: "All", label: "All Training Types" },
    { value: "Security", label: "Security" },
    { value: "AI Ethics", label: "AI Ethics" },
    { value: "Privacy", label: "Privacy" },
    { value: "Compliance", label: "Compliance" },
  ];

  const pageSizeOptions = [
    { value: "10 / page", label: "10 / page" },
    { value: "20 / page", label: "20 / page" },
    { value: "50 / page", label: "50 / page" },
  ];

  // Category badge styling helper
  const getCategoryBadge = (category) => {
    switch (category?.toLowerCase()) {
      case "security":
        return "bg-[#E8F8F0] text-[#12B76A] border-emerald-200/50";
      case "ai ethics":
        return "bg-[#F4EBFF] text-[#7F56D9] border-purple-200/50";
      case "privacy":
        return "bg-[#EFF8FF] text-[#175CD3] border-blue-200/50";
      case "compliance":
        return "bg-[#FFF4ED] text-[#FF692E] border-orange-200/50";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-[#E8F8F0] text-[#12B76A]";
      case "pending":
        return "bg-[#FEF6E7] text-[#F79009]";
      case "overdue":
        return "bg-[#FEE4E2] text-[#F04438]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 32;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search training or employee..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        {/* Right: Dropdowns + Create Training Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <div className="w-[130px] sm:w-[135px]">
            <Dropdown
              label="All Statuses"
              items={statusOptions}
              selected={selectedStatus}
              onSelect={(val) => setSelectedStatus(val)}
              variant="sm"
              className="w-full"
            />
          </div>

          {/* Department Dropdown */}
          <div className="w-[145px] sm:w-[150px]">
            <Dropdown
              label="All Departments"
              items={departmentOptions}
              selected={selectedDepartment}
              onSelect={(val) => setSelectedDepartment(val)}
              variant="sm"
              className="w-full"
            />
          </div>

          {/* Training Types Dropdown */}
          <div className="w-[150px] sm:w-[155px]">
            <Dropdown
              label="All Training Types"
              items={typeOptions}
              selected={selectedType}
              onSelect={(val) => setSelectedType(val)}
              variant="sm"
              className="w-full"
            />
          </div>

          {/* Create Training Button */}
          <button
            type="button"
            onClick={onCreateTraining}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#0ca09e] text-white text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Training</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-light-gray text-light-black font-semibold uppercase tracking-wider text-[11px] bg-white">
                <th className="py-3.5 pl-6 pr-3 whitespace-nowrap">EMPLOYEE</th>
                <th className="py-3.5 px-3 whitespace-nowrap">TRAINING</th>
                <th className="py-3.5 px-3 whitespace-nowrap">CATEGORY</th>
                <th className="py-3.5 px-3 whitespace-nowrap">ASSIGNED ON</th>
                <th className="py-3.5 px-3 whitespace-nowrap">DUE DATE</th>
                <th className="py-3.5 px-3 whitespace-nowrap">STATUS</th>
                <th className="py-3.5 px-3 whitespace-nowrap">COMPLETED ON</th>
                <th className="py-3.5 pl-3 pr-6 whitespace-nowrap">SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60">
              {logs.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#F9FAFB]/70 transition-colors"
                >
                  {/* Employee info (Avatar + Name + Role) */}
                  <td className="py-3.5 pl-6 pr-3">
                    <div className="flex items-center gap-2.5 min-w-[160px]">
                      {item.avatar ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                          <img
                            src={item.avatar}
                            alt={item.employeeName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {item.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-dark-black truncate leading-tight">
                          {item.employeeName}
                        </span>
                        <span className="text-[11px] text-light-black truncate mt-0.5">
                          {item.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Training Title */}
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-dark-black/90 whitespace-nowrap">
                      {item.trainingTitle}
                    </span>
                  </td>

                  {/* Category Badge */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryBadge(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Assigned On */}
                  <td className="py-3.5 px-3 text-medium-black whitespace-nowrap">
                    {item.assignedOn}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-3 text-medium-black whitespace-nowrap">
                    {item.dueDate}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Completed On */}
                  <td className="py-3.5 px-3 text-medium-black whitespace-nowrap">
                    {item.completedOn || "—"}
                  </td>

                  {/* Score */}
                  <td className="py-3.5 pl-3 pr-6 font-bold text-dark-black/90 font-secondary whitespace-nowrap">
                    {item.score || "—"}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-light-black text-xs"
                  >
                    No training logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-light-gray/70 text-xs bg-white">
          {/* Showing Count */}
          <span className="text-light-black font-medium">
            Showing <span className="text-dark-black font-semibold">1</span> to{" "}
            <span className="text-dark-black font-semibold">
              {Math.min(logs.length, pageSize)}
            </span>{" "}
            of <span className="text-dark-black font-semibold">{totalItems}</span>{" "}
            assignments
          </span>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage?.(Math.max(1, currentPage - 1))}
              className="w-7 h-7 rounded-md border border-light-gray flex items-center justify-center text-medium-black hover:bg-light-gray transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page 1 (Active) */}
            <button
              type="button"
              onClick={() => setCurrentPage?.(1)}
              className={`w-7 h-7 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentPage === 1
                  ? "bg-primary text-white shadow-2xs"
                  : "hover:bg-light-gray text-dark-black/80"
              }`}
            >
              1
            </button>

            {/* Page 2 */}
            <button
              type="button"
              onClick={() => setCurrentPage?.(2)}
              className={`w-7 h-7 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentPage === 2
                  ? "bg-primary text-white shadow-2xs"
                  : "hover:bg-light-gray text-dark-black/80"
              }`}
            >
              2
            </button>

            {/* Page 3 */}
            <button
              type="button"
              onClick={() => setCurrentPage?.(3)}
              className={`w-7 h-7 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentPage === 3
                  ? "bg-primary text-white shadow-2xs"
                  : "hover:bg-light-gray text-dark-black/80"
              }`}
            >
              3
            </button>

            <span className="text-light-black px-0.5 text-xs font-semibold">...</span>

            {/* Page 32 */}
            <button
              type="button"
              onClick={() => setCurrentPage?.(32)}
              className={`w-7 h-7 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentPage === 32
                  ? "bg-primary text-white shadow-2xs"
                  : "hover:bg-light-gray text-dark-black/80"
              }`}
            >
              32
            </button>

            {/* Next */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage?.(Math.min(totalPages, currentPage + 1))}
              className="w-7 h-7 rounded-md border border-light-gray flex items-center justify-center text-medium-black hover:bg-light-gray transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Page Size Dropdown */}
            <div className="ml-2 w-28">
              <Dropdown
                items={pageSizeOptions}
                selected={`${pageSize} / page`}
                onSelect={(val) => {
                  const size = parseInt(val, 10) || 10;
                  setPageSize?.(size);
                }}
                variant="small"
                placement="top"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

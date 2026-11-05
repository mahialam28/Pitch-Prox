"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import TemplateCard from "./template-card";
import { CAMPAIGN_TEMPLATES } from "../templates-data";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "Onboarding", label: "Onboarding" },
  { value: "Retention", label: "Retention" },
  { value: "Announcement", label: "Announcement" },
  { value: "Transactional", label: "Transactional" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
];

const PAGE_SIZE_OPTIONS = [
  { value: "6", label: "6 / page" },
  { value: "12", label: "12 / page" },
  { value: "24", label: "24 / page" },
];

export default function TemplatesSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Filtered Templates List
  const filteredTemplates = useMemo(() => {
    return CAMPAIGN_TEMPLATES.filter((template) => {
      // Search filter
      const matchesSearch =
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.previewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory;

      // Status filter
      const matchesStatus =
        selectedStatus === "all" || template.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Pagination calculation
  const totalItems = filteredTemplates.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentTemplates = filteredTemplates.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (val) => {
    const size = parseInt(val, 10) || 6;
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Header Toolbar (Title, Search, Filters, New Template Button) */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Left: Title & Subtitle */}
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg sm:text-xl font-bold text-dark-black/85 tracking-tight">
            Email Templates
          </h2>
          <p className="text-xs sm:text-[13px] text-light-black">
            Create and manage reusable email designs for campaigns and journeys.
          </p>
        </div>

        {/* Right: Search, Filters, and New Template Solid Button */}
        <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-black" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-2xs"
            />
          </div>

          {/* Category Dropdown */}
          <div className="min-w-[130px]">
            <Dropdown
              items={CATEGORY_OPTIONS}
              selected={selectedCategory}
              onSelect={(val) => {
                setSelectedCategory(val);
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

          {/* + New Template Solid Teal Button */}
          <button
            type="button"
            onClick={() =>
              router.push("/super-admin/campaigns-journeys/templates/new-template")
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-medium-teal text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ml-auto lg:ml-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* 2. Templates Grid (3 Columns on Desktop) */}
      {currentTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {currentTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl border border-light-gray p-12 text-center flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-medium text-light-black">
            No templates found matching your search or filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedStatus("all");
            }}
            className="px-4 py-2 text-xs font-semibold text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 3. Pagination Footer */}
      {totalItems > 0 && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* Showing X to Y of Z */}
          <span className="text-xs text-light-black font-normal">
            Showing {startIndex + 1} to {endIndex} of {totalItems} templates
          </span>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-medium-black hover:text-dark-black hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer bg-white shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary text-white shadow-2xs"
                    : "border border-light-gray text-medium-black hover:text-dark-black hover:border-slate-300 bg-white shadow-2xs"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-medium-black hover:text-dark-black hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer bg-white shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Page Size Select */}
            <div className="min-w-[100px] ml-1">
              <Dropdown
                items={PAGE_SIZE_OPTIONS}
                selected={String(pageSize)}
                onSelect={handlePageSizeChange}
                variant="small"
                className="w-full"
                buttonClassName="w-full justify-between"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

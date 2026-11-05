"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";
import LibraryStats from "./components/library-stats";
import BrowseFormat from "./components/browse-format";
import MaterialsGrid from "./components/materials-grid";

const categoryOptions = [
  { value: "All", label: "All Categories" },
  { value: "Security", label: "Security" },
  { value: "Privacy", label: "Privacy" },
  { value: "AI Ethics", label: "AI Ethics" },
  { value: "Compliance", label: "Compliance" },
];

const formatOptions = [
  { value: "All", label: "All Formats" },
  { value: "PDF", label: "PDF" },
  { value: "Video", label: "Video" },
  { value: "Document", label: "Document" },
];

const departmentOptions = [
  { value: "All", label: "All Departments" },
  { value: "Security", label: "Security" },
  { value: "HR & People", label: "HR & People" },
  { value: "Operations", label: "Operations" },
  { value: "Sales & Growth", label: "Sales & Growth" },
];

const sortOptions = [
  { value: "Recently Added", label: "Sort: Recently Added" },
  { value: "Alphabetical", label: "Sort: Alphabetical" },
  { value: "Most Assigned", label: "Sort: Most Assigned" },
];

export default function TrainingLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Recently Added");
  const [activeFormatCard, setActiveFormatCard] = useState(null);

  const handleUploadMaterial = () => {
    toast.success("Upload material dialog triggered");
  };

  const handleSelectFormatFromCard = (formatId) => {
    setActiveFormatCard(formatId);
    if (formatId === "pdf") setSelectedFormat("PDF");
    else if (formatId === "video") setSelectedFormat("Video");
    else if (formatId === "doc") setSelectedFormat("Document");
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Header with Breadcrumb & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <Link
            href="/super-admin/compliance-audit/training-logs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Training Logs</span>
            <span className="text-light-black">/</span>
            <span className="text-medium-black">Training Library</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">
            Training Library
          </h1>
          <p className="text-xs sm:text-sm text-medium-black">
            Browse and manage training materials, guides, and videos for your team.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUploadMaterial}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#0ca09e] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <LibraryStats />

      {/* Search & Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search training materials..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Categories */}
          <div className="w-[130px] sm:w-[140px]">
            <Dropdown
              items={categoryOptions}
              selected={selectedCategory}
              onSelect={(val) => setSelectedCategory(val)}
              variant="compact"
              className="w-full"
              buttonClassName="py-2.5 text-xs font-semibold"
            />
          </div>

          {/* Formats */}
          <div className="w-[125px] sm:w-[130px]">
            <Dropdown
              items={formatOptions}
              selected={selectedFormat}
              onSelect={(val) => setSelectedFormat(val)}
              variant="compact"
              className="w-full"
              buttonClassName="py-2.5 text-xs font-semibold"
            />
          </div>

          {/* Departments */}
          <div className="w-[140px] sm:w-[150px]">
            <Dropdown
              items={departmentOptions}
              selected={selectedDept}
              onSelect={(val) => setSelectedDept(val)}
              variant="compact"
              className="w-full"
              buttonClassName="py-2.5 text-xs font-semibold"
            />
          </div>

          {/* Sort */}
          <div className="w-[160px] sm:w-[170px]">
            <Dropdown
              items={sortOptions}
              selected={selectedSort}
              onSelect={(val) => setSelectedSort(val)}
              variant="compact"
              className="w-full"
              buttonClassName="py-2.5 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Browse by Format Section */}
      <BrowseFormat
        onSelectFormat={handleSelectFormatFromCard}
        activeFormat={activeFormatCard}
      />

      {/* All Training Materials Grid */}
      <MaterialsGrid />
    </div>
  );
}

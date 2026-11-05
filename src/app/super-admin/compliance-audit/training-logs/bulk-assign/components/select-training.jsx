"use client";

import React from "react";
import { Search } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Checkbox from "@/components/shared/checkbox";

const initialCourses = [
  {
    id: "course-1",
    title: "AI Ethics & Responsible Use",
    category: "AI Ethics",
    format: "Document",
  },
  {
    id: "course-2",
    title: "AI Ethics & Responsible Use",
    category: "AI Ethics",
    format: "Video",
  },
  {
    id: "course-3",
    title: "Data Privacy & Protection",
    category: "Privacy",
    format: "PDF",
  },
];

const categoryOptions = [
  { value: "All", label: "All Categories" },
  { value: "AI Ethics", label: "AI Ethics" },
  { value: "Privacy", label: "Privacy" },
  { value: "Security", label: "Security" },
  { value: "Compliance", label: "Compliance" },
];

const formatOptions = [
  { value: "All", label: "All Formats" },
  { value: "PDF", label: "PDF" },
  { value: "Document", label: "Document" },
  { value: "Video", label: "Video" },
];

export default function SelectTraining({
  selectedCourses,
  setSelectedCourses,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedFormat,
  setSelectedFormat,
}) {
  const handleToggleCourse = (id) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCategoryBadge = (category) => {
    switch (category?.toLowerCase()) {
      case "ai ethics":
        return "bg-[#F4EBFF] text-[#7F56D9]";
      case "privacy":
        return "bg-[#EFF8FF] text-[#175CD3]";
      case "security":
        return "bg-[#E8F8F0] text-[#12B76A]";
      case "compliance":
        return "bg-[#FFF4ED] text-[#FF692E]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredCourses = initialCourses.filter((course) => {
    const matchesSearch =
      !searchTerm ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      course.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesFormat =
      selectedFormat === "All" ||
      course.format.toLowerCase() === selectedFormat.toLowerCase();

    return matchesSearch && matchesCategory && matchesFormat;
  });

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
        Select Training
      </h3>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search training courses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        {/* Categories Dropdown */}
        <div className="w-full sm:w-40">
          <Dropdown
            items={categoryOptions}
            selected={selectedCategory}
            onSelect={(val) => setSelectedCategory(val)}
            variant="compact"
            className="w-full"
            buttonClassName="py-2.5 text-xs font-semibold"
          />
        </div>

        {/* No Format filter: a Training can contain PDFs, Documents and Videos */}
      </div>

      {/* Courses List */}
      <div className="flex flex-col divide-y divide-light-gray/60 border border-light-gray rounded-xl overflow-hidden">
        {filteredCourses.map((course) => {
          const isSelected = selectedCourses.includes(course.id);
          return (
            <div
              key={course.id}
              onClick={() => handleToggleCourse(course.id)}
              className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                isSelected ? "bg-primary/5" : "hover:bg-light-gray/40"
              }`}
            >
              {/* Custom Checkbox + Title */}
              <div className="flex items-center gap-3 min-w-0">
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleToggleCourse(course.id)}
                />
                <span className="text-xs sm:text-[13px] font-bold text-dark-black/90 truncate">
                  {course.title}
                </span>
              </div>

              {/* Badges & Format */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getCategoryBadge(
                    course.category
                  )}`}
                >
                  {course.category}
                </span>
                <span className="text-xs text-light-black font-medium w-10 text-right">
                  {course.format}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

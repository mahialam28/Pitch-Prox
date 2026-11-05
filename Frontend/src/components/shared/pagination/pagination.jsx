"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";

const defaultPageSizeOptions = [
  { value: "10 / page", label: "10 / page" },
  { value: "20 / page", label: "20 / page" },
  { value: "50 / page", label: "50 / page" },
];

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  itemLabel = "items",
  pageSizeOptions = defaultPageSizeOptions,
  className = "",
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Generate pagination items
  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const paginationItems = getPaginationItems();
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`p-4 sm:p-6 pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-light-gray/70 text-xs ${className}`}
    >
      {/* Showing Count */}
      <span className="text-light-black font-medium">
        Showing{" "}
        <span className="text-dark-black/85 font-bold font-secondary">
          {startItem}-{endItem}
        </span>{" "}
        of{" "}
        <span className="text-dark-black/85 font-bold font-secondary">
          {totalItems.toLocaleString()}
        </span>{" "}
        {itemLabel}
      </span>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Prev Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          className="w-8 h-8 rounded-lg border border-light-gray flex items-center justify-center text-medium-black hover:bg-light-gray transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Buttons */}
        {paginationItems.map((item, idx) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="text-light-black px-1 font-semibold select-none text-xs"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(item);
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange?.(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "hover:bg-light-gray text-dark-black/80"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          className="w-8 h-8 rounded-lg border border-light-gray flex items-center justify-center text-medium-black hover:bg-light-gray transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Page Size Dropdown */}
        {onPageSizeChange && (
          <div className="ml-2">
            <Dropdown
              items={pageSizeOptions}
              selected={`${pageSize} / page`}
              onSelect={(val) => {
                const size = parseInt(val, 10) || 10;
                onPageSizeChange(size);
              }}
              variant="small"
              placement="top"
              className="w-28"
            />
          </div>
        )}
      </div>
    </div>
  );
}

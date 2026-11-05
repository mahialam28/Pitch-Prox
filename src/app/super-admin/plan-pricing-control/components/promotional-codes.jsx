"use client";

import React, { useState } from "react";
import { Plus, Pencil, Copy, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export const initialPromoCodesData = [
  {
    id: "promo-1",
    code: "SAVE20",
    type: "Percentage Discount",
    value: "20% Off",
    appliesTo: "All Plans",
    used: 24,
    maxUses: 200,
    expiration: "Dec 31, 2024",
    status: "Active",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "promo-2",
    code: "NEWUSER",
    type: "Fixed Amount",
    value: "$10 Off",
    appliesTo: "All Plans",
    used: 56,
    maxUses: 500,
    expiration: "Jan 15, 2025",
    status: "Scheduled",
    statusStyle: "bg-sky-50 text-sky-600 border border-sky-100",
  },
  {
    id: "promo-3",
    code: "PROX50",
    type: "Free Reports",
    value: "50 Reports",
    appliesTo: "Pro, ProX",
    used: 8,
    maxUses: 100,
    expiration: "Jul 31, 2025",
    status: "Active",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "promo-4",
    code: "TRIAL7",
    type: "Trial Extension",
    value: "7 Days",
    appliesTo: "All Plans",
    used: 13,
    maxUses: 300,
    expiration: "Jun 30, 2025",
    status: "Active",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "promo-5",
    code: "FREEMORE",
    type: "Free Calls",
    value: "100 Calls",
    appliesTo: "Basic, Pro",
    used: 31,
    maxUses: 250,
    expiration: "May 31, 2025",
    status: "Expired",
    statusStyle: "bg-slate-100 text-slate-500 border border-slate-200",
  },
  {
    id: "promo-6",
    code: "SPRING30",
    type: "Percentage Discount",
    value: "30% Off",
    appliesTo: "All Plans",
    used: 45,
    maxUses: 150,
    expiration: "Mar 31, 2025",
    status: "Active",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "promo-7",
    code: "VIPAGENT",
    type: "Free Reports",
    value: "20 Reports",
    appliesTo: "Pro, ProX",
    used: 18,
    maxUses: 80,
    expiration: "Aug 15, 2025",
    status: "Active",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
];

export const PromotionalCodes = ({
  promoCodes = initialPromoCodesData,
  onAddNewCode,
  onEditCode,
  onDeleteCode,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  const totalItems = promoCodes.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentCodes = promoCodes.slice(startIndex, endIndex);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Promo code "${code}" copied to clipboard!`);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Scheduled":
        return "bg-sky-50 text-sky-600 border border-sky-100";
      case "Expired":
      default:
        return "bg-slate-100 text-slate-500 border border-slate-200";
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight font-secondary">
            Promotional Codes
          </h2>
          <p className="text-xs sm:text-sm text-medium-black mt-0.5">
            Create and manage promotional codes and discounts.
          </p>
        </div>

        {/* Add Promo Code Button */}
        <button
          type="button"
          onClick={onAddNewCode}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Promo Code</span>
        </button>
      </div>

      {/* Table Container Card */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead className="bg-white">
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                <th className="py-3.5 pl-5 sm:pl-6 pr-4 font-semibold">CODE</th>
                <th className="py-3.5 px-3 font-semibold">TYPE</th>
                <th className="py-3.5 px-3 font-semibold">VALUE</th>
                <th className="py-3.5 px-3 font-semibold">APPLIES TO</th>
                <th className="py-3.5 px-3 font-semibold">USAGE</th>
                <th className="py-3.5 px-3 font-semibold">EXPIRATION</th>
                <th className="py-3.5 px-3 font-semibold">STATUS</th>
                <th className="py-3.5 pr-5 sm:pr-6 pl-3 font-semibold text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {currentCodes.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors group"
                >
                  {/* Code */}
                  <td className="py-3.5 pl-5 sm:pl-6 pr-4">
                    <span className="font-bold text-dark-black/85 font-mono text-xs">
                      {item.code}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-3">
                    <span className="text-medium-black font-medium">
                      {item.type}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-dark-black/80">
                      {item.value}
                    </span>
                  </td>

                  {/* Applies To */}
                  <td className="py-3.5 px-3">
                    <span className="text-medium-black font-medium">
                      {item.appliesTo}
                    </span>
                  </td>

                  {/* Usage */}
                  <td className="py-3.5 px-3">
                    <span className="text-medium-black font-medium">
                      {item.used} / {item.maxUses}
                    </span>
                  </td>

                  {/* Expiration */}
                  <td className="py-3.5 px-3">
                    <span className="text-medium-black font-medium">
                      {item.expiration}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold leading-tight ${
                        item.statusStyle || getStatusBadgeStyle(item.status)
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pr-5 sm:pr-6 pl-3 text-right">
                    <div className="flex items-center justify-end gap-2 text-light-black">
                      <button
                        type="button"
                        onClick={() => onEditCode(item)}
                        className="p-1 rounded-md hover:text-primary hover:bg-light-gray/60 transition-colors cursor-pointer"
                        title="Edit Promo Code"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.code)}
                        className="p-1 rounded-md hover:text-primary hover:bg-light-gray/60 transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCode(item.id, item.code)}
                        className="p-1 rounded-md hover:text-red hover:bg-red/10 transition-colors cursor-pointer"
                        title="Delete Code"
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

        {/* Table Footer / Pagination Controls */}
        <div className="p-4 sm:p-5 border-t border-light-gray/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-light-black">
          {/* Showing Count */}
          <span className="font-medium">
            Showing {startIndex + 1} to {endIndex} of {totalItems} promo codes
          </span>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Pagination numbers */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
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
                )
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page Size Dropdown */}
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
                  {[5, 10, 20].map((size) => (
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
    </div>
  );
};

export default PromotionalCodes;

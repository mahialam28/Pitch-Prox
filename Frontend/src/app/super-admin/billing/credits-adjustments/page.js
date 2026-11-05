"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  FileText,
  CreditCard,
  AlertTriangle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import toast from "react-hot-toast";
import ApplyCreditAdjustmentModal from "../components/apply-credit-adjustment-modal";

const initialAdjustmentsData = [
  {
    id: "ADJ-2024-0128",
    customer: "Jennifer Smith, Acme Inc.",
    type: "Call Credit",
    value: "100 calls",
    reason: "Courtesy credit",
    date: "May 2, 2024",
  },
  {
    id: "ADJ-2024-0127",
    customer: "John Smith, Smith Realty Group",
    type: "Call Credit",
    value: "100 calls",
    reason: "Service Interruption",
    date: "May 1, 2024",
  },
  {
    id: "ADJ-2024-0126",
    customer: "Acme Inc.",
    type: "Report Credit",
    value: "5 reports",
    reason: "Reporting issue",
    date: "Apr 30, 2024",
  },
  {
    id: "ADJ-2024-0125",
    customer: "Sarah Johnson, Johnson Properties",
    type: "Call Credit",
    value: "100 calls",
    reason: "Billing correction",
    date: "Apr 29, 2024",
  },
  {
    id: "ADJ-2024-0124",
    customer: "Mike Davis, Davis Investments",
    type: "Call Credit",
    value: "100 calls",
    reason: "Account correction",
    date: "Apr 28, 2024",
  },
  {
    id: "ADJ-2024-0123",
    customer: "Tom Wilson, Wilson Realty",
    type: "Call Credit",
    value: "50 calls",
    reason: "Support resolution",
    date: "Apr 27, 2024",
  },
  {
    id: "ADJ-2024-0122",
    customer: "Emily Wilson, Wilson & Co",
    type: "Dollar Credit",
    value: "$50.00",
    reason: "Renewal loyalty bonus",
    date: "Apr 25, 2024",
  },
  {
    id: "ADJ-2024-0121",
    customer: "Robert Chen, Chen Capital",
    type: "Discount",
    value: "20% off",
    reason: "Annual plan promotion",
    date: "Apr 22, 2024",
  },
  {
    id: "ADJ-2024-0120",
    customer: "Jessica Taylor, Taylor Real Estate",
    type: "Call Credit",
    value: "75 calls",
    reason: "Trial extension bonus",
    date: "Apr 20, 2024",
  },
  {
    id: "ADJ-2024-0119",
    customer: "David Miller, Miller Holdings",
    type: "Report Credit",
    value: "10 reports",
    reason: "Volume partner reward",
    date: "Apr 18, 2024",
  },
  {
    id: "ADJ-2024-0118",
    customer: "Amanda Hayes, Hayes & Partners",
    type: "Dollar Credit",
    value: "$25.00",
    reason: "Billing alignment credit",
    date: "Apr 15, 2024",
  },
  {
    id: "ADJ-2024-0117",
    customer: "Lucas Vance, Vance Realty",
    type: "Call Credit",
    value: "120 calls",
    reason: "Platform migration goodwill",
    date: "Apr 14, 2024",
  },
  {
    id: "ADJ-2024-0116",
    customer: "Rachel Green, Green Valley Properties",
    type: "Report Credit",
    value: "8 reports",
    reason: "Quarterly review bonus",
    date: "Apr 11, 2024",
  },
  {
    id: "ADJ-2024-0115",
    customer: "Kevin Brooks, Brooks Realty Group",
    type: "Call Credit",
    value: "50 calls",
    reason: "Service delay compensation",
    date: "Apr 09, 2024",
  },
  {
    id: "ADJ-2024-0114",
    customer: "Samantha Reed, Reed & Associates",
    type: "Discount",
    value: "15% off",
    reason: "Semi-annual discount",
    date: "Apr 06, 2024",
  },
  {
    id: "ADJ-2024-0113",
    customer: "Brian Cooper, Cooper Commercial",
    type: "Dollar Credit",
    value: "$100.00",
    reason: "Referral partner credit",
    date: "Apr 04, 2024",
  },
  {
    id: "ADJ-2024-0112",
    customer: "Elena Rostova, Rostova Capital",
    type: "Call Credit",
    value: "100 calls",
    reason: "Onboarding courtesy package",
    date: "Apr 02, 2024",
  },
  {
    id: "ADJ-2024-0111",
    customer: "Marcus Aurel, Aurel Properties",
    type: "Report Credit",
    value: "12 reports",
    reason: "Data discrepancy compensation",
    date: "Mar 30, 2024",
  },
  {
    id: "ADJ-2024-0110",
    customer: "Chloe Bennett, Bennett Realty",
    type: "Dollar Credit",
    value: "$40.00",
    reason: "Downtime credit voucher",
    date: "Mar 28, 2024",
  },
  {
    id: "ADJ-2024-0109",
    customer: "Jonathan Ward, Ward Investments",
    type: "Call Credit",
    value: "60 calls",
    reason: "Support tier upgrade bonus",
    date: "Mar 25, 2024",
  },
];

const perPageOptions = [5, 10, 20];

export default function SuperAdminCreditsAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState(initialAdjustmentsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const pageSizeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target)) {
        setPageSizeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreditApplied = (newAdjustment) => {
    setAdjustments((prev) => [newAdjustment, ...prev]);
  };

  const filteredAdjustments = adjustments.filter(
    (item) =>
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredAdjustments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentRows = filteredAdjustments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "Call Credit":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
            <Phone className="w-3 h-3" />
            <span>Call Credit</span>
          </span>
        );
      case "Report Credit":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100 whitespace-nowrap">
            <FileText className="w-3 h-3" />
            <span>Report Credit</span>
          </span>
        );
      case "Dollar Credit":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-primary border border-teal-100 whitespace-nowrap">
            <CreditCard className="w-3 h-3" />
            <span>Dollar Credit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100 whitespace-nowrap">
            {type}
          </span>
        );
    }
  };

  const kpiSummary = [
    {
      id: "total",
      title: "TOTAL ADJUSTMENTS",
      value: `${adjustments.length}`,
      subtitle: "18 added this month",
      icon: FileCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "account-credits",
      title: "ACCOUNT CREDITS",
      value: "$18,430",
      subtitle: "Total issued",
      icon: CreditCard,
      iconBg: "bg-light-teal text-primary",
    },
    {
      id: "call-credits",
      title: "CALL CREDITS",
      value: "1,250",
      subtitle: "Available calls",
      icon: Phone,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "report-credits",
      title: "REPORT CREDITS",
      value: "780",
      subtitle: "Available reports",
      icon: FileText,
      iconBg: "bg-sky-50 text-sky-600",
    },
    {
      id: "pending-approval",
      title: "PENDING APPROVAL",
      value: "5",
      subtitle: "Requires review",
      icon: AlertTriangle,
      iconBg: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        {/* Top Breadcrumb & Go to Billing Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-light-black">
            <Link
              href="/super-admin/billing"
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Billing
            </Link>
            <span>/</span>
            <span className="text-dark-black/85 font-semibold">Credits & Adjustments</span>
          </div>

          {/* Back to Billing button */}
          <Link
            href="/super-admin/billing"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black/85 hover:bg-light-gray hover:text-primary transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Billing</span>
          </Link>
        </div>

        {/* Page Title & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full flex flex-col gap-1 min-w-0">
            <Title variant="small" className="!text-dark-black/90 font-bold">
              Credits & Adjustments
            </Title>
            <Text variant="small" className="text-medium-black">
              Review, manage, and track all customer credits and billing adjustments.
            </Text>
          </div>

          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Credit / Adjustment</span>
          </button>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiSummary.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                      {card.title}
                    </span>
                    <span className="text-2xl font-bold text-dark-black/85 tracking-tight mt-0.5">
                      {card.value}
                    </span>
                    <span className="text-[11px] font-medium text-light-black mt-0.5">
                      {card.subtitle}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Table Card */}
        <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col justify-between min-h-[500px]">
          {/* Search bar & Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-light-gray/60 mb-2">
            <div className="relative w-64 sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-black" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search adjustments..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-light-gray rounded-xl text-dark-black/85 placeholder:text-light-black/60 focus:outline-none focus:border-primary shadow-2xs"
              />
            </div>

            <span className="text-xs text-light-black font-medium">
              {totalItems} total adjustments
            </span>
          </div>

          {/* Table Container */}
          <div className="w-full flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                  <th className="py-3 px-3 font-semibold">Adjustment ID</th>
                  <th className="py-3 px-3 font-semibold">
                    <div>CUSTOMER</div>
                    <div className="text-[10px] text-light-black font-normal mt-0.5">COMPANY</div>
                  </th>
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 font-semibold">Value</th>
                  <th className="py-3 px-3 font-semibold">Reason</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/40 text-xs">
                {currentRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-primary/5 transition-colors group"
                  >
                    {/* Adjustment ID */}
                    <td className="py-3.5 px-3 align-middle font-bold text-dark-black/80 font-mono text-xs whitespace-nowrap">
                      {row.id}
                    </td>

                    {/* Customer / Company */}
                    <td className="py-3.5 px-3 align-middle font-semibold text-dark-black/85 whitespace-nowrap">
                      {row.customer}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                      {getTypeBadge(row.type)}
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-3 align-middle font-semibold text-dark-black/85 whitespace-nowrap">
                      {row.value}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-3 align-middle text-medium-black whitespace-nowrap">
                      {row.reason}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 align-middle text-medium-black whitespace-nowrap">
                      {row.date}
                    </td>
                  </tr>
                ))}

                {currentRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-medium-black text-xs"
                    >
                      No adjustments found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-light-gray/60 text-xs text-medium-black flex-shrink-0 mt-4">
            <div>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} adjustments
            </div>

            <div className="flex items-center gap-2">
              {/* Prev button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border border-light-gray transition-colors ${
                  currentPage === 1
                    ? "text-light-black opacity-50 cursor-not-allowed"
                    : "text-medium-black hover:bg-light-gray cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    currentPage === page
                      ? "bg-primary text-white shadow-xs"
                      : "text-medium-black hover:bg-light-gray border border-transparent hover:border-light-gray cursor-pointer"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border border-light-gray transition-colors ${
                  currentPage === totalPages || totalPages === 0
                    ? "text-light-black opacity-50 cursor-not-allowed"
                    : "text-medium-black hover:bg-light-gray cursor-pointer"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Page Size Selector */}
              <div className="relative ml-2" ref={pageSizeRef}>
                <button
                  type="button"
                  onClick={() => setPageSizeOpen(!pageSizeOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-light-gray text-xs font-medium text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                >
                  <span>{pageSize} / page</span>
                  <ChevronDown className="w-3 h-3 text-medium-black" />
                </button>

                <AnimatePresence>
                  {pageSizeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute right-0 bottom-full mb-1 w-24 bg-white rounded-lg shadow-lg border border-light-gray py-1 z-40 text-xs"
                    >
                      {perPageOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => {
                            setPageSize(opt);
                            setCurrentPage(1);
                            setPageSizeOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left font-medium transition-colors ${
                            pageSize === opt
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-dark-black/80 hover:bg-light-gray"
                          }`}
                        >
                          {opt} / page
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Credit Modal */}
      <ApplyCreditAdjustmentModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={handleCreditApplied}
      />
    </>
  );
}

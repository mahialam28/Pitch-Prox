"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Clock,
  AlertTriangle,
  User,
  RefreshCw,
  Mail,
  CreditCard,
  PenLine,
  CircleX,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import PaymentActivityModal from "./payment-activity-modal";
import InvoicePreviewModal from "./invoice-preview-modal";

export const initialBillingQueueData = [
  {
    id: "bq-1",
    userId: "13",
    name: "John Smith",
    company: "Smith Realty Group",
    plan: "Pro",
    status: "Past Due",
    amountDue: "$199.00",
    dueDate: "Due May 2, 2024",
    nextInvoice: "May 2, 2024",
    method: "VISA •••• 4242",
    failed: 2,
  },
  {
    id: "bq-2",
    userId: "13",
    name: "Sarah Johnson",
    company: "Johnson Properties",
    plan: "ProX",
    status: "Failed Payment",
    amountDue: "$349.00",
    dueDate: "Due Apr 30, 2024",
    nextInvoice: "Apr 30, 2024",
    method: "VISA •••• 4242",
    failed: 3,
  },
  {
    id: "bq-3",
    userId: "13",
    name: "Mike Davis",
    company: "Davis Investments",
    plan: "Basic",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "May 15, 2024",
    method: "VISA •••• 1111",
    failed: 0,
  },
  {
    id: "bq-4",
    userId: "13",
    name: "Emily Wilson",
    company: "Wilson & Co Real Estate",
    plan: "Pro",
    status: "Past Due",
    amountDue: "$199.00",
    dueDate: "Due May 4, 2024",
    nextInvoice: "May 4, 2024",
    method: "MC •••• 8831",
    failed: 1,
  },
  {
    id: "bq-5",
    userId: "13",
    name: "Robert Chen",
    company: "Chen Capital Properties",
    plan: "ProX",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "May 20, 2024",
    method: "AMEX •••• 3004",
    failed: 0,
  },
  {
    id: "bq-6",
    userId: "13",
    name: "Jessica Taylor",
    company: "Taylor Horizon Group",
    plan: "Basic",
    status: "Failed Payment",
    amountDue: "$99.00",
    dueDate: "Due May 1, 2024",
    nextInvoice: "May 1, 2024",
    method: "VISA •••• 5590",
    failed: 2,
  },
  {
    id: "bq-7",
    userId: "13",
    name: "David Miller",
    company: "Miller Estates",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "May 28, 2024",
    method: "VISA •••• 7721",
    failed: 0,
  },
  {
    id: "bq-8",
    userId: "13",
    name: "Amanda Hayes",
    company: "Hayes & Associates",
    plan: "ProX",
    status: "Past Due",
    amountDue: "$349.00",
    dueDate: "Due May 5, 2024",
    nextInvoice: "May 5, 2024",
    method: "VISA •••• 9012",
    failed: 1,
  },
  {
    id: "bq-9",
    userId: "13",
    name: "Lucas Vance",
    company: "Vance Holdings",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 1, 2024",
    method: "VISA •••• 3341",
    failed: 0,
  },
  {
    id: "bq-10",
    userId: "13",
    name: "Rachel Green",
    company: "Green Peak Realty",
    plan: "Basic",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 3, 2024",
    method: "VISA •••• 6612",
    failed: 0,
  },
  {
    id: "bq-11",
    userId: "13",
    name: "Kevin Brooks",
    company: "Brooks Brokerage",
    plan: "ProX",
    status: "Failed Payment",
    amountDue: "$349.00",
    dueDate: "Due May 2, 2024",
    nextInvoice: "May 2, 2024",
    method: "VISA •••• 1980",
    failed: 2,
  },
  {
    id: "bq-12",
    userId: "13",
    name: "Samantha Reed",
    company: "Reed Commercial Group",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 5, 2024",
    method: "MC •••• 7744",
    failed: 0,
  },
  {
    id: "bq-13",
    userId: "13",
    name: "Brian Cooper",
    company: "Cooper & Partners",
    plan: "ProX",
    status: "Past Due",
    amountDue: "$349.00",
    dueDate: "Due May 8, 2024",
    nextInvoice: "May 8, 2024",
    method: "VISA •••• 6610",
    failed: 1,
  },
  {
    id: "bq-14",
    userId: "13",
    name: "Elena Rostova",
    company: "Rostov Real Estate",
    plan: "Basic",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 10, 2024",
    method: "VISA •••• 4492",
    failed: 0,
  },
  {
    id: "bq-15",
    userId: "13",
    name: "Marcus Aurel",
    company: "Aurel Group Realty",
    plan: "Pro",
    status: "Past Due",
    amountDue: "$199.00",
    dueDate: "Due May 10, 2024",
    nextInvoice: "May 10, 2024",
    method: "AMEX •••• 5001",
    failed: 2,
  },
  {
    id: "bq-16",
    userId: "13",
    name: "Chloe Bennett",
    company: "Bennett Luxe Living",
    plan: "ProX",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 12, 2024",
    method: "VISA •••• 8820",
    failed: 0,
  },
  {
    id: "bq-17",
    userId: "13",
    name: "Jonathan Ward",
    company: "Ward & Co Properties",
    plan: "Basic",
    status: "Failed Payment",
    amountDue: "$99.00",
    dueDate: "Due May 3, 2024",
    nextInvoice: "May 3, 2024",
    method: "MC •••• 3311",
    failed: 3,
  },
  {
    id: "bq-18",
    userId: "13",
    name: "Victoria Price",
    company: "Price Capital Advisors",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 15, 2024",
    method: "VISA •••• 9922",
    failed: 0,
  },
  {
    id: "bq-19",
    userId: "13",
    name: "Daniel Miller",
    company: "Miller & Sons Holdings",
    plan: "ProX",
    status: "Past Due",
    amountDue: "$349.00",
    dueDate: "Due May 12, 2024",
    nextInvoice: "May 12, 2024",
    method: "VISA •••• 1109",
    failed: 1,
  },
  {
    id: "bq-20",
    userId: "13",
    name: "Sophia Martinez",
    company: "Martinez Realty Group",
    plan: "Basic",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 18, 2024",
    method: "VISA •••• 4481",
    failed: 0,
  },
  {
    id: "bq-21",
    userId: "13",
    name: "Alexander Wright",
    company: "Wright Commercial",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 20, 2024",
    method: "AMEX •••• 7731",
    failed: 0,
  },
  {
    id: "bq-22",
    userId: "13",
    name: "Olivia Thorne",
    company: "Thorne Luxury Homes",
    plan: "ProX",
    status: "Failed Payment",
    amountDue: "$349.00",
    dueDate: "Due May 4, 2024",
    nextInvoice: "May 4, 2024",
    method: "MC •••• 5521",
    failed: 2,
  },
  {
    id: "bq-23",
    userId: "13",
    name: "Brandon Cole",
    company: "Cole Investment Realty",
    plan: "Basic",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 21, 2024",
    method: "VISA •••• 2290",
    failed: 0,
  },
  {
    id: "bq-24",
    userId: "13",
    name: "Natalie Evans",
    company: "Pacific Rim Assets",
    plan: "ProX",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 22, 2024",
    method: "VISA •••• 1098",
    failed: 0,
  },
];

const perPageOptions = [5, 10, 20];

export const BillingQueue = ({
  data = initialBillingQueueData,
  onActionClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Invoice Preview Modal State
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const pageSizeRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target)) {
        setPageSizeOpen(false);
      }
      if (openDropdownId && !e.target.closest(".action-dropdown-container")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentRows = data.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowClick = (row) => {
    setSelectedCustomerForModal(row);
    setIsModalOpen(true);
  };

  const handleAction = (actionName, item) => {
    setOpenDropdownId(null);
    if (onActionClick) {
      onActionClick(actionName, item);
      return;
    }

    if (actionName === "View Invoice") {
      setSelectedCustomerForModal(item);
      setSelectedInvoiceForModal({
        invoiceNumber: `INV-2024-${item.id.replace("bq-", "218")}`,
        customer: item.name,
        company: item.company,
        amount: item.amountDue === "—" ? "$199.00" : item.amountDue,
        status: item.status === "Active" ? "Paid" : item.status,
        date: item.nextInvoice,
      });
      setIsInvoiceModalOpen(true);
    } else if (actionName === "View Payment History") {
      setSelectedCustomerForModal(item);
      setIsModalOpen(true);
    } else if (actionName === "Escalate Support Ticket") {
      const ticketId = `#TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      toast.success(
        `Support ticket ${ticketId} created & escalated for ${item.name}!`
      );
    } else {
      toast.success(`${actionName} triggered for ${item.name}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Past Due":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red/10 text-red border border-red/20 whitespace-nowrap">
            Past Due
          </span>
        );
      case "Failed Payment":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red/10 text-red border border-red/20 whitespace-nowrap">
            Failed Payment
          </span>
        );
      case "Active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
            Active
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-light-gray text-medium-black whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="w-full h-auto min-h-[540px] xl:h-[540px] bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-light-gray/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
              1. Billing Queue
            </h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-medium-black bg-light-gray rounded-full">
              {totalItems}
            </span>
          </div>
        </div>

        {/* Table Scrollable Container - Fixed height with inner scroll */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto my-2">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                {/* Stacked Customer over Company (No /) */}
                <th className="py-3 pr-4 pl-1 font-semibold">
                  <div>CUSTOMER</div>
                  <div className="text-[10px] text-light-black font-normal mt-0.5">COMPANY</div>
                </th>
                <th className="py-3 px-3 font-semibold">Plan</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Amount Due</th>
                <th className="py-3 px-3 font-semibold">Next Invoice</th>
                <th className="py-3 px-3 font-semibold">Method</th>
                <th className="py-3 px-3 font-semibold text-center">Failed</th>
                <th className="py-3 pl-3 pr-1 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/40 text-xs">
              {currentRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  {/* Clickable Customer / Company Names linking to users/13 */}
                  <td
                    className="py-3 pr-4 pl-1 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/internal-sales-representative/users/${row.userId || "13"}`}
                      className="flex flex-col group/link cursor-pointer"
                    >
                      <span className="font-bold text-dark-black/80 text-xs leading-tight group-hover/link:text-primary transition-colors">
                        {row.name}
                      </span>
                      <span className="text-[11px] font-medium text-light-black mt-0.5 group-hover/link:text-primary transition-colors">
                        {row.company}
                      </span>
                    </Link>
                  </td>

                  {/* Plan */}
                  <td className="py-3 px-3 align-middle font-medium text-medium-black">
                    {row.plan}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 align-middle text-center">
                    {getStatusBadge(row.status)}
                  </td>

                  {/* Amount Due */}
                  <td className="py-3 px-3 align-middle text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-dark-black/80">
                        {row.amountDue}
                      </span>
                      {row.dueDate && (
                        <span className="text-[10px] font-semibold text-red mt-0.5">
                          {row.dueDate}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Next Invoice */}
                  <td className="py-3 px-3 align-middle font-medium text-medium-black whitespace-nowrap">
                    {row.nextInvoice}
                  </td>

                  {/* Method */}
                  <td className="py-3 px-3 align-middle font-medium text-medium-black whitespace-nowrap">
                    {row.method}
                  </td>

                  {/* Failed */}
                  <td className="py-3 px-3 align-middle text-center font-bold">
                    <span
                      className={
                        row.failed > 0
                          ? "text-red"
                          : "text-medium-black font-normal"
                      }
                    >
                      {row.failed}
                    </span>
                  </td>

                  {/* Actions Dropdown */}
                  <td
                    className="py-3 pl-3 pr-1 align-middle text-right relative action-dropdown-container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-block text-left">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === row.id ? null : row.id
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-medium-black bg-light-gray/70 hover:bg-light-gray rounded-lg border border-light-gray transition-colors cursor-pointer"
                      >
                        <span>Actions</span>
                        <ChevronDown className="w-3 h-3 text-medium-black" />
                      </button>

                      <AnimatePresence>
                        {openDropdownId === row.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 2 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 z-40 mt-1 w-56 bg-white rounded-xl shadow-lg border border-light-gray py-1 text-xs overflow-hidden text-left"
                          >
                            {/* View Account links to users/13 */}
                            <Link
                              href={`/internal-sales-representative/users/${row.userId || "13"}`}
                              onClick={() => setOpenDropdownId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                            >
                              <User className="w-3.5 h-3.5 text-dark-teal" />
                              <span>View Account</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleAction("View Invoice", row)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-primary" />
                              <span>View Invoice</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleAction("View Payment History", row)
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-light-blue" />
                              <span>View Payment History</span>
                            </button>

                            <div className="h-px bg-light-gray my-1" />

                            <button
                              type="button"
                              onClick={() => handleAction("Retry payment", row)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-medium-black" />
                              <span>Retry payment</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction("Send invoice", row)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 text-medium-black" />
                              <span>Send invoice</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction("Update payment method", row)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-medium-black" />
                              <span>Update payment method</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction("Add note", row)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                            >
                              <PenLine className="w-3.5 h-3.5 text-medium-black" />
                              <span>Add note</span>
                            </button>
                            <div className="h-px bg-light-gray my-1" />

                            <button
                              type="button"
                              onClick={() =>
                                handleAction("Escalate Support Ticket", row)
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Escalate Support Ticket</span>
                            </button>

                            <div className="h-px bg-light-gray my-1" />

                            <button
                              type="button"
                              onClick={() => handleAction("Cancel subscription", row)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <CircleX className="w-3.5 h-3.5 text-red-600" />
                              <span>Cancel subscription</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-light-gray/60 text-xs text-medium-black flex-shrink-0">
          <div>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} accounts
          </div>

          <div className="flex items-center gap-2">
            {/* Prev button */}
            <button
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
                onClick={() => handlePageChange(page)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "border border-light-gray text-medium-black hover:bg-light-gray cursor-pointer"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-7 h-7 flex items-center justify-center rounded-lg border border-light-gray transition-colors ${
                currentPage === totalPages
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

      {/* Customer Payment Activity & Account Modal */}
      <PaymentActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomerForModal}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoiceForModal}
        customer={selectedCustomerForModal}
      />
    </>
  );
};

export default BillingQueue;

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
  Pencil,
  CircleX,
} from "lucide-react";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import { showSavedToast } from "@/lib/toast";
import { CancelSubscriptionModal } from "@/app/super-admin/users/[id]/components/account-dialogs";
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
    company: "Miller Holdings",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "May 18, 2024",
    method: "VISA •••• 7721",
    failed: 0,
  },
  {
    id: "bq-8",
    userId: "13",
    name: "Amanda Hayes",
    company: "Hayes & Partners",
    plan: "ProX",
    status: "Failed Payment",
    amountDue: "$349.00",
    dueDate: "Due Apr 28, 2024",
    nextInvoice: "Apr 28, 2024",
    method: "VISA •••• 9012",
    failed: 1,
  },
  {
    id: "bq-9",
    userId: "13",
    name: "Lucas Vance",
    company: "Vance Realty",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "May 22, 2024",
    method: "VISA •••• 3341",
    failed: 0,
  },
  {
    id: "bq-10",
    userId: "13",
    name: "Rachel Green",
    company: "Green Valley Properties",
    plan: "Basic",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "May 25, 2024",
    method: "VISA •••• 6612",
    failed: 0,
  },
  {
    id: "bq-11",
    userId: "13",
    name: "Kevin Brooks",
    company: "Brooks Realty Group",
    plan: "ProX",
    status: "Past Due",
    amountDue: "$349.00",
    dueDate: "Due Apr 29, 2024",
    nextInvoice: "Apr 29, 2024",
    method: "VISA •••• 1980",
    failed: 2,
  },
  {
    id: "bq-12",
    userId: "13",
    name: "Samantha Reed",
    company: "Reed & Associates",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "May 27, 2024",
    method: "VISA •••• 4410",
    failed: 0,
  },
  {
    id: "bq-13",
    userId: "13",
    name: "Brian Cooper",
    company: "Cooper Commercial",
    plan: "ProX",
    status: "Failed Payment",
    amountDue: "$349.00",
    dueDate: "Due Apr 25, 2024",
    nextInvoice: "Apr 25, 2024",
    method: "VISA •••• 9921",
    failed: 3,
  },
  {
    id: "bq-14",
    userId: "13",
    name: "Elena Rostova",
    company: "Rostova Capital",
    plan: "Pro",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "May 30, 2024",
    method: "MC •••• 7123",
    failed: 0,
  },
  {
    id: "bq-15",
    userId: "13",
    name: "Marcus Aurel",
    company: "Aurel Properties",
    plan: "Basic",
    status: "Past Due",
    amountDue: "$99.00",
    dueDate: "Due May 3, 2024",
    nextInvoice: "May 3, 2024",
    method: "VISA •••• 6640",
    failed: 1,
  },
  {
    id: "bq-16",
    userId: "13",
    name: "Chloe Bennett",
    company: "Bennett Realty",
    plan: "ProX",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 02, 2024",
    method: "AMEX •••• 5519",
    failed: 0,
  },
  {
    id: "bq-17",
    userId: "13",
    name: "Jonathan Ward",
    company: "Ward Investments",
    plan: "Pro",
    status: "Failed Payment",
    amountDue: "$199.00",
    dueDate: "Due Apr 24, 2024",
    nextInvoice: "Apr 24, 2024",
    method: "VISA •••• 8841",
    failed: 2,
  },
  {
    id: "bq-18",
    userId: "13",
    name: "Sophia Martinez",
    company: "Martinez Realty",
    plan: "ProX",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 05, 2024",
    method: "VISA •••• 3302",
    failed: 0,
  },
  {
    id: "bq-19",
    userId: "13",
    name: "Daniel Foster",
    company: "Foster & Co",
    plan: "Basic",
    status: "Past Due",
    amountDue: "$99.00",
    dueDate: "Due May 5, 2024",
    nextInvoice: "May 5, 2024",
    method: "MC •••• 4120",
    failed: 1,
  },
  {
    id: "bq-20",
    userId: "13",
    name: "Olivia Zhang",
    company: "Zhang Properties",
    plan: "ProX",
    status: "Active",
    amountDue: "—",
    dueDate: null,
    nextInvoice: "Jun 10, 2024",
    method: "VISA •••• 1098",
    failed: 0,
  },
];

const perPageOptions = [5, 10, 20];

export const BillingQueue = ({
  data = initialBillingQueueData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingRow, setCancellingRow] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  // Modals state
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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

  const handleViewActivity = (row) => {
    setSelectedCustomerForModal(row);
    setIsActivityModalOpen(true);
  };

  const handlePreviewInvoice = (row) => {
    setSelectedCustomerForModal(row);
    setIsPreviewModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
            Active
          </span>
        );
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
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-light-gray text-medium-black whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case "ProX":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
            ProX
          </span>
        );
      case "Pro":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-600 border border-sky-100">
            Pro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-light-gray text-medium-black">
            {plan}
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

        {/* Table Scrollable Container - Exactly 5 rows visible without scroll */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto my-2">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                <th className="py-3 pr-3 pl-1 font-semibold">
                  <div>CUSTOMER</div>
                  <div className="text-[10px] text-light-black font-normal mt-0.5">COMPANY</div>
                </th>
                <th className="py-3 px-3 font-semibold text-center">Plan</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Amount Due</th>
                <th className="py-3 px-3 font-semibold">Next Invoice</th>
                <th className="py-3 px-3 font-semibold">Payment Method</th>
                <th className="py-3 px-3 font-semibold text-center">Failed</th>
                <th className="py-3 pl-3 pr-1 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/40 text-xs">
              {currentRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-primary/5 transition-colors group"
                >
                  {/* Customer & Company */}
                  <td className="py-2.5 pr-3 pl-1 align-middle whitespace-nowrap">
                    <div className="flex flex-col">
                      <Link
                        href={`/super-admin/users/${row.userId}`}
                        className="font-bold text-dark-black/80 hover:text-primary transition-colors cursor-pointer text-xs"
                      >
                        {row.name}
                      </Link>
                      <span className="text-[11px] text-light-black font-medium mt-0.5">
                        {row.company}
                      </span>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="py-2.5 px-3 align-middle text-center whitespace-nowrap">
                    {getPlanBadge(row.plan)}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3 align-middle text-center whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>

                  {/* Amount Due */}
                  <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span
                        className={`font-bold ${
                          row.amountDue !== "—" ? "text-dark-black/80" : "text-medium-black/60"
                        }`}
                      >
                        {row.amountDue}
                      </span>
                      {row.dueDate && (
                        <span className="text-[10px] font-medium text-red mt-0.5">
                          {row.dueDate}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Next Invoice */}
                  <td className="py-2.5 px-3 align-middle text-medium-black whitespace-nowrap font-medium">
                    {row.nextInvoice}
                  </td>

                  {/* Payment Method */}
                  <td className="py-2.5 px-3 align-middle font-medium text-medium-black whitespace-nowrap">
                    {row.method}
                  </td>

                  {/* Failed count */}
                  <td className="py-2.5 px-3 align-middle text-center whitespace-nowrap">
                    {row.failed > 0 ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red/10 text-red font-bold text-[11px]">
                        {row.failed}
                      </span>
                    ) : (
                      <span className="text-medium-black/40 text-xs font-semibold">0</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 pl-3 pr-1 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePreviewInvoice(row)}
                        title="Preview Invoice"
                        className="p-1.5 rounded-lg border border-light-gray bg-white hover:bg-light-gray text-light-black hover:text-primary transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleViewActivity(row)}
                        title="View Activity History"
                        className="p-1.5 rounded-lg border border-light-gray bg-white hover:bg-light-gray text-light-black hover:text-sky-600 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>

                      {/* Billing actions (design only: confirmations, nothing is charged or sent) */}
                      <ActionMenu
                        label={`Billing actions for ${row.name}`}
                        triggerClassName="p-1.5 rounded-lg border border-light-gray bg-white hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer shadow-2xs"
                        items={[
                          { label: "Retry payment", icon: RefreshCw, onClick: () => showSavedToast("Payment retry started", `We're retrying the charge for ${row.company}.`) },
                          { label: "Send invoice", icon: Mail, onClick: () => showSavedToast("Invoice sent", `${row.name} was emailed the latest invoice.`) },
                          { label: "Update payment method", icon: CreditCard, onClick: () => showSavedToast("Update link sent", `${row.name} will get a secure link to update their card.`) },
                          { label: "Add note", icon: Pencil, onClick: () => showSavedToast("Note added", `A billing note was added to ${row.company}.`) },
                          { divider: true },
                          { label: "Cancel subscription", icon: CircleX, danger: true, onClick: () => setCancellingRow(row) },
                        ]}
                      />
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
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} entries
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

      {/* Payment Activity Timeline Modal */}
      <PaymentActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        customer={selectedCustomerForModal}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        customer={selectedCustomerForModal}
      />

      <CancelSubscriptionModal key={cancellingRow?.id ?? "none"} isOpen={Boolean(cancellingRow)} onClose={() => setCancellingRow(null)} />
    </>
  );
};

export default BillingQueue;

"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import PaymentActivityModal from "./payment-activity-modal";

export const initialPaymentActivityData = [
  {
    id: "pa-1",
    date: "May 1, 2024",
    time: "10:42 AM",
    customer: "Mike Davis",
    userId: "13",
    amount: "$99.00",
    paymentMethod: "VISA •••• 4242",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3N8XK2L0",
  },
  {
    id: "pa-2",
    date: "Apr 30, 2024",
    time: "4:20 PM",
    customer: "Sarah Johnson",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "VISA •••• 4242",
    result: "Failed",
    failureReason: "Insufficient funds",
    processorId: "pi_3N7WL1K9",
  },
  {
    id: "pa-3",
    date: "Apr 28, 2024",
    time: "2:11 PM",
    customer: "Tom Wilson",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "VISA •••• 4242",
    result: "Failed",
    failureReason: "Card declined",
    processorId: "pi_3N6VK0J8",
  },
  {
    id: "pa-4",
    date: "Apr 27, 2024",
    time: "11:15 AM",
    customer: "Emily Wilson",
    userId: "13",
    amount: "$199.00",
    paymentMethod: "MC •••• 8831",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3N5UJ9H7",
  },
  {
    id: "pa-5",
    date: "Apr 25, 2024",
    time: "09:30 AM",
    customer: "Robert Chen",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "AMEX •••• 3004",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3N4TI8G6",
  },
  {
    id: "pa-6",
    date: "Apr 24, 2024",
    time: "03:45 PM",
    customer: "Jessica Taylor",
    userId: "13",
    amount: "$99.00",
    paymentMethod: "VISA •••• 5590",
    result: "Failed",
    failureReason: "Expired card",
    processorId: "pi_3N3SH7F5",
  },
  {
    id: "pa-7",
    date: "Apr 22, 2024",
    time: "01:20 PM",
    customer: "David Miller",
    userId: "13",
    amount: "$199.00",
    paymentMethod: "VISA •••• 7721",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3N2RG6E4",
  },
  {
    id: "pa-8",
    date: "Apr 20, 2024",
    time: "10:05 AM",
    customer: "Amanda Hayes",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "VISA •••• 9012",
    result: "Failed",
    failureReason: "Card declined",
    processorId: "pi_3N1QF5D3",
  },
  {
    id: "pa-9",
    date: "Apr 18, 2024",
    time: "04:50 PM",
    customer: "Lucas Vance",
    userId: "13",
    amount: "$199.00",
    paymentMethod: "VISA •••• 3341",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3N0PE4C2",
  },
  {
    id: "pa-10",
    date: "Apr 15, 2024",
    time: "11:00 AM",
    customer: "Rachel Green",
    userId: "13",
    amount: "$99.00",
    paymentMethod: "VISA •••• 6612",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3MZOD3B1",
  },
  {
    id: "pa-11",
    date: "Apr 14, 2024",
    time: "02:15 PM",
    customer: "Kevin Brooks",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "VISA •••• 1980",
    result: "Failed",
    failureReason: "Insufficient funds",
    processorId: "pi_3MYNC2A0",
  },
  {
    id: "pa-12",
    date: "Apr 12, 2024",
    time: "09:40 AM",
    customer: "Samantha Reed",
    userId: "13",
    amount: "$199.00",
    paymentMethod: "VISA •••• 4410",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3MXMB1Z9",
  },
  {
    id: "pa-13",
    date: "Apr 10, 2024",
    time: "05:10 PM",
    customer: "Brian Cooper",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "VISA •••• 9921",
    result: "Failed",
    failureReason: "Card declined",
    processorId: "pi_3MWLA0Y8",
  },
  {
    id: "pa-14",
    date: "Apr 08, 2024",
    time: "08:25 AM",
    customer: "Elena Rostova",
    userId: "13",
    amount: "$199.00",
    paymentMethod: "MC •••• 7123",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3MVKZ9X7",
  },
  {
    id: "pa-15",
    date: "Apr 06, 2024",
    time: "01:50 PM",
    customer: "Marcus Aurel",
    userId: "13",
    amount: "$99.00",
    paymentMethod: "VISA •••• 6640",
    result: "Failed",
    failureReason: "Expired card",
    processorId: "pi_3MUJY8W6",
  },
  {
    id: "pa-16",
    date: "Apr 04, 2024",
    time: "11:35 AM",
    customer: "Chloe Bennett",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "AMEX •••• 5519",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3MTIX7V5",
  },
  {
    id: "pa-17",
    date: "Apr 02, 2024",
    time: "03:15 PM",
    customer: "Jonathan Ward",
    userId: "13",
    amount: "$199.00",
    paymentMethod: "VISA •••• 8841",
    result: "Failed",
    failureReason: "Insufficient funds",
    processorId: "pi_3MSHW6U4",
  },
  {
    id: "pa-18",
    date: "Mar 30, 2024",
    time: "10:00 AM",
    customer: "Sophia Martinez",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "VISA •••• 3302",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3MRGV5T3",
  },
  {
    id: "pa-19",
    date: "Mar 28, 2024",
    time: "04:30 PM",
    customer: "Daniel Foster",
    userId: "13",
    amount: "$99.00",
    paymentMethod: "MC •••• 4120",
    result: "Failed",
    failureReason: "Card declined",
    processorId: "pi_3MQFU4S2",
  },
  {
    id: "pa-20",
    date: "Mar 25, 2024",
    time: "09:15 AM",
    customer: "Olivia Zhang",
    userId: "13",
    amount: "$349.00",
    paymentMethod: "VISA •••• 1098",
    result: "Success",
    failureReason: "—",
    processorId: "pi_3MPET3R1",
  },
];

const perPageOptions = [5, 10, 20];

export const PaymentActivity = ({
  data = initialPaymentActivityData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleRowClick = (row) => {
    setSelectedCustomerForModal(row);
    setIsModalOpen(true);
  };

  const getResultBadge = (result) => {
    switch (result) {
      case "Success":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
            Success
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red/10 text-red border border-red/20 whitespace-nowrap">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-light-gray text-medium-black whitespace-nowrap">
            {result}
          </span>
        );
    }
  };

  return (
    <>
      <div className="w-full h-auto min-h-[540px] xl:h-[540px] bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Header with View all link */}
        <div className="flex items-center justify-between pb-3 border-b border-light-gray/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
              3. Payment Activity
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCustomerForModal(data[0]);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer"
          >
            <span>View all</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table Scrollable Container */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto my-2">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                <th className="py-3 pr-3 pl-1 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold text-right">Amount</th>
                <th className="py-3 px-3 font-semibold">Payment Method</th>
                <th className="py-3 px-3 font-semibold text-center">Result</th>
                <th className="py-3 px-3 font-semibold">Failure Reason</th>
                <th className="py-3 pl-3 pr-1 font-semibold text-right">Processor ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/40 text-xs">
              {currentRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  {/* Date & Time */}
                  <td className="py-2.5 pr-3 pl-1 align-middle whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-dark-black/80 text-xs">
                        {row.date}
                      </span>
                      <span className="text-[11px] font-medium text-light-black mt-0.5">
                        {row.time}
                      </span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td
                    className="py-2.5 px-3 align-middle font-bold text-dark-black/80 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/super-admin/users/${row.userId || "13"}`}
                      className="hover:text-primary transition-colors cursor-pointer"
                    >
                      {row.customer}
                    </Link>
                  </td>

                  {/* Amount */}
                  <td className="py-2.5 px-3 align-middle font-bold text-dark-black/80 text-right whitespace-nowrap">
                    {row.amount}
                  </td>

                  {/* Payment Method */}
                  <td className="py-2.5 px-3 align-middle font-medium text-medium-black whitespace-nowrap">
                    {row.paymentMethod}
                  </td>

                  {/* Result */}
                  <td className="py-2.5 px-3 align-middle text-center whitespace-nowrap">
                    {getResultBadge(row.result)}
                  </td>

                  {/* Failure Reason */}
                  <td className="py-2.5 px-3 align-middle font-medium whitespace-nowrap">
                    <span
                      className={
                        row.failureReason !== "—"
                          ? "text-red font-semibold text-xs"
                          : "text-medium-black/60"
                      }
                    >
                      {row.failureReason}
                    </span>
                  </td>

                  {/* Processor ID */}
                  <td className="py-2.5 pl-3 pr-1 align-middle text-right font-mono text-[11px] text-light-black whitespace-nowrap">
                    {row.processorId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-light-gray/60 text-xs text-medium-black flex-shrink-0">
          <div>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} transactions
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

      {/* Customer Payment Activity Modal */}
      <PaymentActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomerForModal}
      />
    </>
  );
};

export default PaymentActivity;

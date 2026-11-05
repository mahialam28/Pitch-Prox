"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import CustomerInvoiceHistoryModal from "./customer-invoice-history-modal";
import InvoicePreviewModal from "./invoice-preview-modal";

export const initialInvoicesData = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2024-2187",
    customer: "John Smith",
    userId: "13",
    amount: "$199.00",
    status: "Past Due",
    date: "May 2, 2024",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2024-2186",
    customer: "Sarah Johnson",
    userId: "13",
    amount: "$349.00",
    status: "Open",
    date: "Apr 30, 2024",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2024-2185",
    customer: "Mike Davis",
    userId: "13",
    amount: "$99.00",
    status: "Paid",
    date: "Apr 15, 2024",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2024-2184",
    customer: "Emily Wilson",
    userId: "13",
    amount: "$199.00",
    status: "Paid",
    date: "Apr 4, 2024",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2024-2183",
    customer: "Jessica Taylor",
    userId: "13",
    amount: "$99.00",
    status: "Past Due",
    date: "Apr 1, 2024",
  },
  {
    id: "inv-6",
    invoiceNumber: "INV-2024-2182",
    customer: "Robert Chen",
    userId: "13",
    amount: "$349.00",
    status: "Paid",
    date: "Mar 20, 2024",
  },
  {
    id: "inv-7",
    invoiceNumber: "INV-2024-2181",
    customer: "David Miller",
    userId: "13",
    amount: "$199.00",
    status: "Paid",
    date: "Mar 18, 2024",
  },
  {
    id: "inv-8",
    invoiceNumber: "INV-2024-2180",
    customer: "Amanda Hayes",
    userId: "13",
    amount: "$349.00",
    status: "Open",
    date: "Mar 15, 2024",
  },
  {
    id: "inv-9",
    invoiceNumber: "INV-2024-2179",
    customer: "Lucas Vance",
    userId: "13",
    amount: "$199.00",
    status: "Paid",
    date: "Mar 10, 2024",
  },
  {
    id: "inv-10",
    invoiceNumber: "INV-2024-2178",
    customer: "Rachel Green",
    userId: "13",
    amount: "$99.00",
    status: "Paid",
    date: "Mar 5, 2024",
  },
  {
    id: "inv-11",
    invoiceNumber: "INV-2024-2177",
    customer: "Kevin Brooks",
    userId: "13",
    amount: "$349.00",
    status: "Past Due",
    date: "Mar 2, 2024",
  },
  {
    id: "inv-12",
    invoiceNumber: "INV-2024-2176",
    customer: "Samantha Reed",
    userId: "13",
    amount: "$199.00",
    status: "Paid",
    date: "Feb 28, 2024",
  },
  {
    id: "inv-13",
    invoiceNumber: "INV-2024-2175",
    customer: "Brian Cooper",
    userId: "13",
    amount: "$349.00",
    status: "Open",
    date: "Feb 25, 2024",
  },
  {
    id: "inv-14",
    invoiceNumber: "INV-2024-2174",
    customer: "Elena Rostova",
    userId: "13",
    amount: "$199.00",
    status: "Paid",
    date: "Feb 20, 2024",
  },
  {
    id: "inv-15",
    invoiceNumber: "INV-2024-2173",
    customer: "Marcus Aurel",
    userId: "13",
    amount: "$99.00",
    status: "Past Due",
    date: "Feb 18, 2024",
  },
  {
    id: "inv-16",
    invoiceNumber: "INV-2024-2172",
    customer: "Chloe Bennett",
    userId: "13",
    amount: "$349.00",
    status: "Paid",
    date: "Feb 14, 2024",
  },
  {
    id: "inv-17",
    invoiceNumber: "INV-2024-2171",
    customer: "Jonathan Ward",
    userId: "13",
    amount: "$199.00",
    status: "Open",
    date: "Feb 10, 2024",
  },
  {
    id: "inv-18",
    invoiceNumber: "INV-2024-2170",
    customer: "Victoria Price",
    userId: "13",
    amount: "$199.00",
    status: "Paid",
    date: "Feb 5, 2024",
  },
  {
    id: "inv-19",
    invoiceNumber: "INV-2024-2169",
    customer: "Daniel Miller",
    userId: "13",
    amount: "$349.00",
    status: "Past Due",
    date: "Feb 2, 2024",
  },
  {
    id: "inv-20",
    invoiceNumber: "INV-2024-2168",
    customer: "Sophia Martinez",
    userId: "13",
    amount: "$99.00",
    status: "Paid",
    date: "Jan 28, 2024",
  },
  {
    id: "inv-21",
    invoiceNumber: "INV-2024-2167",
    customer: "Alexander Wright",
    userId: "13",
    amount: "$199.00",
    status: "Paid",
    date: "Jan 25, 2024",
  },
  {
    id: "inv-22",
    invoiceNumber: "INV-2024-2166",
    customer: "Olivia Thorne",
    userId: "13",
    amount: "$349.00",
    status: "Past Due",
    date: "Jan 20, 2024",
  },
  {
    id: "inv-23",
    invoiceNumber: "INV-2024-2165",
    customer: "Brandon Cole",
    userId: "13",
    amount: "$99.00",
    status: "Paid",
    date: "Jan 18, 2024",
  },
  {
    id: "inv-24",
    invoiceNumber: "INV-2024-2164",
    customer: "Natalie Evans",
    userId: "13",
    amount: "$349.00",
    status: "Paid",
    date: "Jan 15, 2024",
  },
];

const perPageOptions = [5, 10, 20];

export const InvoiceManagement = ({
  invoices = initialInvoicesData,
  onDownload,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  // Modal States
  const [selectedInvoiceCustomer, setSelectedInvoiceCustomer] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSingleInvoice, setSelectedSingleInvoice] = useState(null);
  const [isSingleInvoiceModalOpen, setIsSingleInvoiceModalOpen] = useState(false);

  const pageSizeRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target)) {
        setPageSizeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.customer.toLowerCase().includes(query) ||
      inv.status.toLowerCase().includes(query) ||
      inv.amount.toLowerCase().includes(query)
    );
  });

  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentRows = filteredInvoices.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowClick = (inv) => {
    setSelectedInvoiceCustomer(inv.customer);
    setIsHistoryModalOpen(true);
  };

  const handleDownload = (e, inv) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(inv);
      return;
    }
    setSelectedSingleInvoice(inv);
    setIsSingleInvoiceModalOpen(true);
    toast.success(`Opening ${inv.invoiceNumber}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Past Due":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red/10 text-red border border-red/20 whitespace-nowrap">
            Past Due
          </span>
        );
      case "Open":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100 whitespace-nowrap">
            Open
          </span>
        );
      case "Paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
            Paid
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
        {/* Top Header with Searchbar at Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-light-gray/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
              2. Invoice Management
            </h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-medium-black bg-light-gray rounded-full">
              {totalItems}
            </span>
          </div>

          {/* Searchbar at Right */}
          <div className="relative w-full sm:w-52 md:w-56">
            <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search invoices..."
              className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-light-gray/50 border border-light-gray rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-dark-black/80 placeholder:text-light-black"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-light-black hover:text-dark-black/80 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Scrollable Container */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto my-2">
          <table className="w-full text-left border-collapse min-w-[420px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                <th className="py-3 pr-3 pl-1 font-semibold">Invoice #</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Amount</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 pl-3 pr-1 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/40 text-xs">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-medium-black">
                    No invoices found matching &ldquo;{searchQuery}&rdquo;
                  </td>
                </tr>
              ) : (
                currentRows.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => handleRowClick(inv)}
                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                  >
                    {/* Invoice # */}
                    <td className="py-3 pr-3 pl-1 align-middle font-medium text-dark-black/80 whitespace-nowrap group-hover:text-primary transition-colors">
                      {inv.invoiceNumber}
                    </td>

                    {/* Customer Name -> links to users/13 or shows invoice history */}
                    <td
                      className="py-3 px-3 align-middle font-bold text-dark-black/80 truncate max-w-[140px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/internal-sales-representative/users/${inv.userId || "13"}`}
                        className="hover:text-primary transition-colors cursor-pointer"
                      >
                        {inv.customer}
                      </Link>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 align-middle font-bold text-dark-black/80 whitespace-nowrap">
                      {inv.amount}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 align-middle text-center whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>

                    {/* Action — Download Button */}
                    <td
                      className="py-3 pl-3 pr-1 align-middle text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, inv)}
                        title={`View / Download ${inv.invoiceNumber}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-light-teal bg-light-teal/30 text-primary hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer shadow-2xs"
                      >
                        <ArrowDownToLine className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-light-gray/60 text-xs text-medium-black flex-shrink-0">
          <div>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} invoices
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

      {/* Customer Invoice History Modal */}
      <CustomerInvoiceHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        customerName={selectedInvoiceCustomer || "John Smith"}
      />

      {/* Single Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={isSingleInvoiceModalOpen}
        onClose={() => setIsSingleInvoiceModalOpen(false)}
        invoice={selectedSingleInvoice}
      />
    </>
  );
};

export default InvoiceManagement;

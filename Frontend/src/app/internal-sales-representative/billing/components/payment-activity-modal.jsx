"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Info } from "lucide-react";

// Predefined mock activity history for specific customers
const customerActivitiesMap = {
  "John Smith": [
    {
      id: "act-js-1",
      date: "May 2, 2024",
      time: "10:42 AM",
      type: "Payment Attempt",
      amount: "$199.00",
      status: "Failed",
      details: "Card declined\nInsufficient funds",
    },
    {
      id: "act-js-2",
      date: "May 2, 2024",
      time: "10:41 AM",
      type: "Payment Attempt",
      amount: "$199.00",
      status: "Failed",
      details: "Card declined\nInsufficient funds",
    },
    {
      id: "act-js-3",
      date: "May 2, 2024",
      time: "10:40 AM",
      type: "Payment Attempt",
      amount: "$199.00",
      status: "Failed",
      details: "Card declined\nInsufficient funds",
    },
    {
      id: "act-js-4",
      date: "May 2, 2024",
      time: "10:55 AM",
      type: "Payment",
      amount: "$199.00",
      status: "Successful",
      details: "Approval Code: 8F3A1B",
    },
    {
      id: "act-js-5",
      date: "May 2, 2024",
      time: "10:39 AM",
      type: "Invoice Generated",
      amount: "$199.00",
      status: "Past Due",
      details: "Invoice #2187\nDue May 2, 2024",
    },
    {
      id: "act-js-6",
      date: "Apr 2, 2024",
      time: "10:12 AM",
      type: "Payment",
      amount: "$199.00",
      status: "Successful",
      details: "Approval Code: 7D2K9L",
    },
    {
      id: "act-js-7",
      date: "Apr 2, 2024",
      time: "10:11 AM",
      type: "Invoice Generated",
      amount: "$199.00",
      status: "Paid",
      details: "Invoice #2142\nPaid Apr 2, 2024",
    },
    {
      id: "act-js-8",
      date: "Mar 2, 2024",
      time: "10:05 AM",
      type: "Payment",
      amount: "$199.00",
      status: "Successful",
      details: "Approval Code: 6C1J8N",
    },
    {
      id: "act-js-9",
      date: "Mar 2, 2024",
      time: "10:00 AM",
      type: "Invoice Generated",
      amount: "$199.00",
      status: "Paid",
      details: "Invoice #2098\nPaid Mar 2, 2024",
    },
    {
      id: "act-js-10",
      date: "Feb 2, 2024",
      time: "09:30 AM",
      type: "Payment",
      amount: "$199.00",
      status: "Successful",
      details: "Approval Code: 5B0H7M",
    },
  ],
  "Sarah Johnson": [
    {
      id: "act-sj-1",
      date: "Apr 30, 2024",
      time: "4:20 PM",
      type: "Payment Attempt",
      amount: "$349.00",
      status: "Failed",
      details: "Card declined\nInsufficient funds",
    },
    {
      id: "act-sj-2",
      date: "Apr 30, 2024",
      time: "4:15 PM",
      type: "Payment Attempt",
      amount: "$349.00",
      status: "Failed",
      details: "Card declined\nInsufficient funds",
    },
    {
      id: "act-sj-3",
      date: "Apr 30, 2024",
      time: "4:00 PM",
      type: "Invoice Generated",
      amount: "$349.00",
      status: "Past Due",
      details: "Invoice #2186\nDue Apr 30, 2024",
    },
    {
      id: "act-sj-4",
      date: "Mar 30, 2024",
      time: "3:45 PM",
      type: "Payment",
      amount: "$349.00",
      status: "Successful",
      details: "Approval Code: 9B2X4K",
    },
    {
      id: "act-sj-5",
      date: "Mar 30, 2024",
      time: "3:30 PM",
      type: "Invoice Generated",
      amount: "$349.00",
      status: "Paid",
      details: "Invoice #2135\nPaid Mar 30, 2024",
    },
    {
      id: "act-sj-6",
      date: "Feb 28, 2024",
      time: "11:20 AM",
      type: "Payment",
      amount: "$349.00",
      status: "Successful",
      details: "Approval Code: 8A1W3J",
    },
    {
      id: "act-sj-7",
      date: "Feb 28, 2024",
      time: "11:15 AM",
      type: "Invoice Generated",
      amount: "$349.00",
      status: "Paid",
      details: "Invoice #2080\nPaid Feb 28, 2024",
    },
  ],
  "Mike Davis": [
    {
      id: "act-md-1",
      date: "May 1, 2024",
      time: "10:42 AM",
      type: "Payment",
      amount: "$99.00",
      status: "Successful",
      details: "Approval Code: 5C3Y1P",
    },
    {
      id: "act-md-2",
      date: "May 1, 2024",
      time: "10:40 AM",
      type: "Invoice Generated",
      amount: "$99.00",
      status: "Paid",
      details: "Invoice #2185\nPaid May 1, 2024",
    },
    {
      id: "act-md-3",
      date: "Apr 1, 2024",
      time: "09:30 AM",
      type: "Payment",
      amount: "$99.00",
      status: "Successful",
      details: "Approval Code: 4A9L2Q",
    },
    {
      id: "act-md-4",
      date: "Apr 1, 2024",
      time: "09:28 AM",
      type: "Invoice Generated",
      amount: "$99.00",
      status: "Paid",
      details: "Invoice #2130\nPaid Apr 1, 2024",
    },
    {
      id: "act-md-5",
      date: "Mar 1, 2024",
      time: "09:15 AM",
      type: "Payment",
      amount: "$99.00",
      status: "Successful",
      details: "Approval Code: 3Z8K1P",
    },
  ],
  "Emily Wilson": [
    {
      id: "act-ew-1",
      date: "May 4, 2024",
      time: "11:15 AM",
      type: "Payment Attempt",
      amount: "$199.00",
      status: "Failed",
      details: "Card declined\nProcessing error",
    },
    {
      id: "act-ew-2",
      date: "May 4, 2024",
      time: "11:00 AM",
      type: "Invoice Generated",
      amount: "$199.00",
      status: "Past Due",
      details: "Invoice #2184\nDue May 4, 2024",
    },
    {
      id: "act-ew-3",
      date: "Apr 27, 2024",
      time: "11:15 AM",
      type: "Payment",
      amount: "$199.00",
      status: "Successful",
      details: "Approval Code: 2H7V8M",
    },
    {
      id: "act-ew-4",
      date: "Apr 27, 2024",
      time: "11:10 AM",
      type: "Invoice Generated",
      amount: "$199.00",
      status: "Paid",
      details: "Invoice #2178\nPaid Apr 27, 2024",
    },
    {
      id: "act-ew-5",
      date: "Mar 27, 2024",
      time: "10:50 AM",
      type: "Payment",
      amount: "$199.00",
      status: "Successful",
      details: "Approval Code: 1G6U7L",
    },
  ],
  "Tom Wilson": [
    {
      id: "act-tw-1",
      date: "Apr 28, 2024",
      time: "2:11 PM",
      type: "Payment Attempt",
      amount: "$349.00",
      status: "Failed",
      details: "Card declined\nCard expired",
    },
    {
      id: "act-tw-2",
      date: "Apr 28, 2024",
      time: "2:00 PM",
      type: "Invoice Generated",
      amount: "$349.00",
      status: "Past Due",
      details: "Invoice #2175\nDue Apr 28, 2024",
    },
    {
      id: "act-tw-3",
      date: "Mar 28, 2024",
      time: "1:45 PM",
      type: "Payment",
      amount: "$349.00",
      status: "Successful",
      details: "Approval Code: 9E4S5J",
    },
    {
      id: "act-tw-4",
      date: "Mar 28, 2024",
      time: "1:30 PM",
      type: "Invoice Generated",
      amount: "$349.00",
      status: "Paid",
      details: "Invoice #2120\nPaid Mar 28, 2024",
    },
  ],
};

export const PaymentActivityModal = ({
  isOpen = false,
  onClose,
  customer = null,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  // Extract customer data gracefully from either payment-activity item or billing-queue item
  const customerName =
    customer.name || customer.customer || "John Smith";
  const companyName =
    customer.company || `${customerName.split(" ")[1] || customerName} Realty Group`;
  const plan = customer.plan || "Pro";
  const status = customer.status || (customer.result === "Success" ? "Active" : "Past Due");
  const customerSince = customer.customerSince || "Jan 18, 2024";
  const paymentMethod =
    customer.method || customer.paymentMethod || "VISA •••• 4242";
  const amount = customer.amount || customer.amountDue || "$199.00";

  // Get activities or fallback to dynamic generation
  const activities = customerActivitiesMap[customerName] || [
    {
      id: "act-dyn-1",
      date: customer.date || "May 2, 2024",
      time: customer.time || "10:42 AM",
      type: customer.result === "Failed" || status === "Past Due" ? "Payment Attempt" : "Payment",
      amount: amount !== "—" ? amount : "$199.00",
      status: customer.result === "Failed" || status === "Past Due" ? "Failed" : "Successful",
      details:
        customer.failureReason && customer.failureReason !== "—"
          ? `Card declined\n${customer.failureReason}`
          : "Approval Code: 8F3A1B",
    },
    {
      id: "act-dyn-2",
      date: customer.date || "May 2, 2024",
      time: "10:39 AM",
      type: "Invoice Generated",
      amount: amount !== "—" ? amount : "$199.00",
      status: status === "Past Due" ? "Past Due" : "Paid",
      details: `Invoice #2187\nDue ${customer.date || "May 2, 2024"}`,
    },
    {
      id: "act-dyn-3",
      date: "Apr 2, 2024",
      time: "10:12 AM",
      type: "Payment",
      amount: amount !== "—" ? amount : "$199.00",
      status: "Successful",
      details: "Approval Code: 7D2K9L",
    },
    {
      id: "act-dyn-4",
      date: "Apr 2, 2024",
      time: "10:11 AM",
      type: "Invoice Generated",
      amount: amount !== "—" ? amount : "$199.00",
      status: "Paid",
      details: "Invoice #2142\nPaid Apr 2, 2024",
    },
    {
      id: "act-dyn-5",
      date: "Mar 2, 2024",
      time: "10:05 AM",
      type: "Payment",
      amount: amount !== "—" ? amount : "$199.00",
      status: "Successful",
      details: "Approval Code: 6C1J8N",
    },
    {
      id: "act-dyn-6",
      date: "Mar 2, 2024",
      time: "10:00 AM",
      type: "Invoice Generated",
      amount: amount !== "—" ? amount : "$199.00",
      status: "Paid",
      details: "Invoice #2098\nPaid Mar 2, 2024",
    },
  ];

  const getStatusBadge = (itemStatus) => {
    switch (itemStatus) {
      case "Failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 whitespace-nowrap">
            Failed
          </span>
        );
      case "Past Due":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 whitespace-nowrap">
            Past Due
          </span>
        );
      case "Successful":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
            Successful
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
            {itemStatus}
          </span>
        );
    }
  };

  const isPastDueOrFailed =
    status === "Past Due" || status === "Failed" || status === "Failed Payment";

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        >
          {/* ================= Modal Header ================= */}
          <div className="p-6 sm:p-8 pb-4 flex items-center justify-between gap-4 border-b border-light-gray">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              Payment Activity – {customerName}
            </h1>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ================= Scrollable Body ================= */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 min-h-0">
            {/* ================= Customer Overview Card ================= */}
            <div className="bg-gray-50/70 rounded-2xl p-4 sm:p-5 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Customer Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                  <User className="h-4.5 w-4.5 text-gray-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-800 leading-snug truncate">
                    {customerName}
                  </span>
                  <span className="text-[11px] text-gray-500 truncate mt-0.5">
                    {companyName}
                  </span>
                </div>
              </div>

              {/* Plan & Status */}
              <div className="flex flex-col justify-center space-y-1">
                <div className="text-xs text-gray-500">
                  Plan: <span className="font-semibold text-gray-800">{plan}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      isPastDueOrFailed ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Customer Since */}
              <div className="flex flex-col justify-center space-y-0.5">
                <span className="text-[11px] text-gray-400 font-medium">Customer Since</span>
                <span className="text-xs font-semibold text-gray-700">
                  {customerSince}
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex flex-col justify-center space-y-0.5">
                <span className="text-[11px] text-gray-400 font-medium">Payment Method</span>
                <span className="text-xs font-semibold text-gray-700">
                  {paymentMethod}
                </span>
              </div>
            </div>

            {/* ================= Activity Table Container (Scrollable) ================= */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="max-h-[340px] overflow-y-auto overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[580px]">
                  <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-xs z-10 border-b border-gray-100">
                    <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Date & Time</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold">Amount</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {activities.map((act) => (
                      <tr
                        key={act.id}
                        className="hover:bg-teal-50/40 transition-colors group"
                      >
                        {/* Date & Time */}
                        <td className="py-3 px-4 align-middle whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-xs">
                              {act.date}
                            </span>
                            <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                              {act.time}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4 align-middle font-medium text-gray-700 whitespace-nowrap">
                          {act.type}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 align-middle font-semibold text-gray-800 whitespace-nowrap">
                          {act.amount}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                          {getStatusBadge(act.status)}
                        </td>

                        {/* Details */}
                        <td className="py-3 px-4 align-middle text-xs font-normal text-gray-600 whitespace-pre-line leading-relaxed">
                          {act.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================= Modal Footer ================= */}
          <div className="px-6 sm:px-8 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Info className="h-4 w-4 text-gray-400 shrink-0" />
              <span>All times shown in Pacific Time (PT)</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentActivityModal;

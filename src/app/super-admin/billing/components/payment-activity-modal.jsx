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
      status: "Open",
      details: "Invoice #2186\nDue May 14, 2024",
    },
    {
      id: "act-sj-4",
      date: "Mar 30, 2024",
      time: "11:20 AM",
      type: "Payment",
      amount: "$349.00",
      status: "Successful",
      details: "Approval Code: 4A9G6L",
    },
    {
      id: "act-sj-5",
      date: "Feb 28, 2024",
      time: "02:45 PM",
      type: "Payment",
      amount: "$349.00",
      status: "Successful",
      details: "Approval Code: 3Z8F5K",
    },
  ],
};

const defaultActivities = [
  {
    id: "act-def-1",
    date: "May 1, 2024",
    time: "10:42 AM",
    type: "Payment",
    amount: "$99.00",
    status: "Successful",
    details: "Approval Code: 9E4B2C",
  },
  {
    id: "act-def-2",
    date: "May 1, 2024",
    time: "10:40 AM",
    type: "Invoice Generated",
    amount: "$99.00",
    status: "Paid",
    details: "Invoice #2185\nPaid May 1, 2024",
  },
  {
    id: "act-def-3",
    date: "Apr 1, 2024",
    time: "09:15 AM",
    type: "Payment",
    amount: "$99.00",
    status: "Successful",
    details: "Approval Code: 8D3A1B",
  },
];

export const PaymentActivityModal = ({ isOpen, onClose, customer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const customerName = customer?.customer || customer?.name || "Customer Account";
  const activities = customerActivitiesMap[customerName] || defaultActivities;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Successful":
      case "Paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            {status}
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red/10 text-red border border-red/20">
            Failed
          </span>
        );
      case "Past Due":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red/10 text-red border border-red/20">
            Past Due
          </span>
        );
      case "Open":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
            Open
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-light-gray text-medium-black">
            {status}
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl border border-light-gray shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-light-gray flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-dark-black tracking-tight flex items-center gap-2">
                  <span>Activity History</span>
                  <span className="text-xs font-normal text-light-black">•</span>
                  <span className="text-sm font-semibold text-primary">
                    {customerName}
                  </span>
                </h3>
                <p className="text-xs text-light-black mt-0.5">
                  Complete chronological timeline of customer payments & invoices.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-light-gray/60 hover:bg-light-gray text-light-black hover:text-dark-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Activity list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="relative border-l-2 border-light-gray/80 ml-4 space-y-6 py-2">
              {activities.map((act) => (
                <div key={act.id} className="relative pl-6">
                  {/* Bullet */}
                  <span
                    className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                      act.status === "Successful" || act.status === "Paid"
                        ? "border-emerald-500"
                        : act.status === "Failed" || act.status === "Past Due"
                        ? "border-red"
                        : "border-sky-500"
                    }`}
                  />

                  <div className="bg-light-gray/20 border border-light-gray/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-dark-black text-sm">
                          {act.type}
                        </span>
                        <span className="text-xs font-bold text-dark-black">
                          {act.amount}
                        </span>
                        {getStatusBadge(act.status)}
                      </div>

                      <p className="text-xs text-light-black whitespace-pre-line font-medium">
                        {act.details}
                      </p>
                    </div>

                    <div className="text-right sm:text-right shrink-0">
                      <span className="text-xs font-bold text-dark-black block">
                        {act.date}
                      </span>
                      <span className="text-[11px] text-light-black font-medium">
                        {act.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-light-gray bg-white flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl border border-light-gray text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
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

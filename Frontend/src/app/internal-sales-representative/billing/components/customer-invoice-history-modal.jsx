"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  ArrowDownToLine,
  Search,
  CheckCircle,
  Clock,
  Building,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

// Predefined mock invoice histories per customer
const customerInvoicesMap = {
  "John Smith": [
    {
      id: "inv-js-1",
      number: "INV-2024-2187",
      date: "May 2, 2024",
      dueDate: "May 16, 2024",
      amount: "$199.00",
      status: "Past Due",
      method: "VISA •••• 4242",
      items: "Pro Plan (Monthly)",
    },
    {
      id: "inv-js-2",
      number: "INV-2024-2045",
      date: "Apr 2, 2024",
      dueDate: "Apr 16, 2024",
      amount: "$199.00",
      status: "Paid",
      method: "VISA •••• 4242",
      items: "Pro Plan (Monthly)",
    },
    {
      id: "inv-js-3",
      number: "INV-2024-1920",
      date: "Mar 2, 2024",
      dueDate: "Mar 16, 2024",
      amount: "$199.00",
      status: "Paid",
      method: "VISA •••• 4242",
      items: "Pro Plan (Monthly)",
    },
    {
      id: "inv-js-4",
      number: "INV-2024-1801",
      date: "Feb 2, 2024",
      dueDate: "Feb 16, 2024",
      amount: "$199.00",
      status: "Paid",
      method: "VISA •••• 4242",
      items: "Pro Plan (Monthly)",
    },
  ],
  "Sarah Johnson": [
    {
      id: "inv-sj-1",
      number: "INV-2024-2186",
      date: "Apr 30, 2024",
      dueDate: "May 14, 2024",
      amount: "$349.00",
      status: "Open",
      method: "VISA •••• 4242",
      items: "ProX Plan (Monthly)",
    },
    {
      id: "inv-sj-2",
      number: "INV-2024-2040",
      date: "Mar 30, 2024",
      dueDate: "Apr 13, 2024",
      amount: "$349.00",
      status: "Paid",
      method: "VISA •••• 4242",
      items: "ProX Plan (Monthly)",
    },
    {
      id: "inv-sj-3",
      number: "INV-2024-1902",
      date: "Feb 28, 2024",
      dueDate: "Mar 13, 2024",
      amount: "$349.00",
      status: "Paid",
      method: "VISA •••• 4242",
      items: "ProX Plan (Monthly)",
    },
  ],
};

export const CustomerInvoiceHistoryModal = ({
  isOpen,
  onClose,
  customerName = "John Smith",
  companyName = "Smith Realty Group",
}) => {
  const [filterStatus, setFilterStatus] = useState("all");

  if (!isOpen) return null;

  const invoices =
    customerInvoicesMap[customerName] || [
      {
        id: "inv-gen-1",
        number: `INV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        date: "May 2, 2024",
        dueDate: "May 16, 2024",
        amount: "$199.00",
        status: "Paid",
        method: "VISA •••• 4242",
        items: "Subscription Plan (Monthly)",
      },
      {
        id: "inv-gen-2",
        number: `INV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        date: "Apr 2, 2024",
        dueDate: "Apr 16, 2024",
        amount: "$199.00",
        status: "Paid",
        method: "VISA •••• 4242",
        items: "Subscription Plan (Monthly)",
      },
      {
        id: "inv-gen-3",
        number: `INV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        date: "Mar 2, 2024",
        dueDate: "Mar 16, 2024",
        amount: "$199.00",
        status: "Paid",
        method: "VISA •••• 4242",
        items: "Subscription Plan (Monthly)",
      },
    ];

  const filteredInvoices =
    filterStatus === "all"
      ? invoices
      : invoices.filter(
          (inv) => inv.status.toLowerCase() === filterStatus.toLowerCase()
        );

  const totalBilled = invoices.reduce(
    (acc, inv) => acc + parseFloat(inv.amount.replace(/[^0-9.]/g, "")),
    0
  );

  const handleDownload = (invNumber) => {
    toast.success(`Downloading ${invNumber}.pdf`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl border border-light-gray shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-dark-black tracking-tight flex items-center gap-2">
                  <span>Invoice History — {customerName}</span>
                </h3>
                <p className="text-xs text-light-black mt-0.5">
                  {companyName} • Total billed to date:{" "}
                  <strong className="text-dark-black">
                    ${totalBilled.toFixed(2)}
                  </strong>
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

          {/* Filter Pills */}
          <div className="px-5 sm:px-6 py-3 border-b border-light-gray bg-light-gray/20 flex items-center gap-2 text-xs">
            <span className="font-semibold text-light-black mr-1">Filter:</span>
            {["all", "Paid", "Open", "Past Due"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterStatus === status
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-white border border-light-gray text-medium-black hover:bg-light-gray"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Invoice History Table */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-gray text-[11px] font-bold text-light-black uppercase">
                  <th className="pb-3 pl-1">Invoice Number</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Description</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 pr-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/40">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3.5 pl-1 font-bold text-dark-black whitespace-nowrap">
                      {inv.number}
                    </td>
                    <td className="py-3.5 px-3 text-medium-black whitespace-nowrap">
                      {inv.date}
                    </td>
                    <td className="py-3.5 px-3 text-light-black">
                      {inv.items}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-dark-black whitespace-nowrap">
                      {inv.amount}
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          inv.status === "Paid"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : inv.status === "Open"
                            ? "bg-sky-50 text-sky-600 border border-sky-100"
                            : "bg-red/10 text-red border border-red/20"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-1 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDownload(inv.number)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        <ArrowDownToLine className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-light-gray bg-light-gray/30 flex items-center justify-between text-xs text-light-black shrink-0">
            <span>Showing {filteredInvoices.length} invoices for {customerName}</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-medium-black bg-white border border-light-gray hover:bg-light-gray rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerInvoiceHistoryModal;

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
  company = "Real Estate Brokerage",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const invoices =
    customerInvoicesMap[customerName] || customerInvoicesMap["John Smith"];

  const filtered = invoices.filter(
    (inv) =>
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadInvoice = (invNum) => {
    toast.success(`Downloaded ${invNum}.pdf`);
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
          className="relative w-full max-w-3xl bg-white rounded-3xl border border-light-gray shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-light-gray flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-dark-black tracking-tight flex items-center gap-2">
                  <span>Customer Invoices</span>
                  <span className="text-xs font-normal text-light-black">•</span>
                  <span className="text-sm font-semibold text-primary">
                    {customerName}
                  </span>
                </h3>
                <p className="text-xs text-light-black mt-0.5">
                  Complete billing history and payment receipt ledger.
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

          {/* Search bar */}
          <div className="p-4 sm:p-5 border-b border-light-gray/60 bg-white/50 shrink-0">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-light-black" />
              <input
                type="text"
                placeholder="Search invoices by number, date, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-light-gray rounded-xl text-dark-black placeholder:text-light-black/60 focus:outline-none focus:border-primary shadow-2xs"
              />
            </div>
          </div>

          {/* Table content */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-semibold">Invoice</th>
                  <th className="pb-3 px-4 font-semibold">Date</th>
                  <th className="pb-3 px-4 font-semibold">Amount</th>
                  <th className="pb-3 px-4 font-semibold">Status</th>
                  <th className="pb-3 pl-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/60 text-xs">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3.5 pr-4 align-middle font-bold text-dark-black">
                      <div className="flex flex-col">
                        <span>{inv.number}</span>
                        <span className="text-[11px] font-normal text-light-black">
                          {inv.items}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-middle text-medium-black">
                      <div className="flex flex-col">
                        <span>{inv.date}</span>
                        <span className="text-[10px] text-light-black">
                          Due: {inv.dueDate}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-middle font-bold text-dark-black">
                      {inv.amount}
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                    <td className="py-3.5 pl-4 align-middle text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(inv.number)}
                        className="p-1.5 rounded-lg border border-light-gray bg-white hover:bg-light-gray text-light-black hover:text-primary transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1 text-xs"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default CustomerInvoiceHistoryModal;

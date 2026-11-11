"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDownToLine, Printer, Mail, FileText } from "lucide-react";
import toast from "react-hot-toast";

export const InvoicePreviewModal = ({ isOpen, onClose, invoice, customer }) => {
  if (!isOpen) return null;

  const invNum = invoice?.invoiceNumber || (invoice?.id ? `INV-${invoice.id}` : "INV-DRAFT");
  const custName = customer?.name || invoice?.customer || "Customer Account";
  const custCompany = customer?.company || "Real Estate Brokerage";
  const amount = invoice?.amount || customer?.amountDue || "$199.00";
  const status = invoice?.status || customer?.status || "Paid";
  const date = invoice?.date || customer?.nextInvoice || "May 2, 2024";

  const handleDownload = () => {
    toast.success(`Downloading ${invNum}.pdf`);
  };

  const handlePrint = () => {
    toast.success(`Preparing ${invNum} for print`);
  };

  const handleSendEmail = () => {
    toast.success(`Invoice ${invNum} sent to customer email`);
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
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-dark-black tracking-tight flex items-center gap-2">
                  <span>{invNum}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      status === "Paid"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-red/10 text-red border border-red/20"
                    }`}
                  >
                    {status}
                  </span>
                </h3>
                <p className="text-xs text-light-black mt-0.5">
                  Issued on {date} • PitchProX Subscription Billing
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

          {/* Invoice Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs text-medium-black">
            {/* From / To row */}
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-light-gray">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-light-black">
                  Billed From
                </p>
                <p className="font-bold text-dark-black text-sm mt-1">PitchProX Inc.</p>
                <p className="text-light-black mt-0.5">100 Tech Blvd, Suite 400</p>
                <p className="text-light-black">San Francisco, CA 94107</p>
                <p className="text-light-black">billing@pitchprox.com</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-light-black">
                  Billed To
                </p>
                <p className="font-bold text-dark-black text-sm mt-1">{custName}</p>
                <p className="text-light-black mt-0.5">{custCompany}</p>
                <p className="text-light-black">United States</p>
                <p className="text-light-black">Payment: Credit Card (Stripe)</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-light-gray rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-light-gray/40 border-b border-light-gray">
                  <tr className="text-[11px] font-semibold text-light-black uppercase">
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Period</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/60">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-dark-black">
                      PitchProX Pro Plan Subscription
                      <span className="block text-[11px] font-normal text-light-black">
                        AI voice agents, call analytics, dialer access
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-light-black">
                      1 Month
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-dark-black">
                      {amount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-xs text-light-black">
                  <span>Subtotal</span>
                  <span>{amount}</span>
                </div>
                <div className="flex justify-between text-xs text-light-black">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-dark-black pt-2 border-t border-light-gray">
                  <span>Total Due</span>
                  <span className="text-primary">{amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-t border-light-gray bg-white shrink-0">
            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-light-gray hover:bg-light-gray text-dark-black transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-light-black" />
              <span>Email Customer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-light-gray hover:bg-light-gray text-dark-black transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-light-black" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-medium-teal text-white transition-colors cursor-pointer shadow-sm"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InvoicePreviewModal;

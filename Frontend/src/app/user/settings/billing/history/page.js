"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiFileText,
  FiDownload,
  FiArrowLeft,
  FiSearch,
} from "react-icons/fi";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import { apiRequest, formatDate } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const filterOptions = [
  { value: "all", label: "All Invoices" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];


const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Failed: "bg-rose-50 text-rose-500",
};

export default function InvoiceHistoryPage() {
  const [filter, setFilter] = useState("all");
  const [invoices, setInvoices] = useState([]);

  // Invoices appear here once payments are connected and the first charge is made
  useEffect(() => {
    apiRequest("/api/v1/billing")
      .then((data) => setInvoices(data.invoices.map((invoice) => ({
        id: invoice.number,
        date: formatDate(invoice.issuedAt),
        amount: invoice.amount,
        amountCents: invoice.amountCents,
        status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
        description: invoice.description,
      }))))
      .catch((error) => showError("Invoices not loaded", error.message));
  }, []);

  const filteredInvoices =
    filter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/user/settings/billing"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-medium-black hover:text-primary transition-colors duration-300 cursor-pointer"
      >
        <FiArrowLeft className="w-3.5 h-3.5" />
        Back to Billing
      </Link>

      {/* Invoice History Card */}
      <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex-shrink-0">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <Text variant="regular" className="font-bold text-dark-black">
                Invoice History
              </Text>
              <Text variant="smaller" className="mt-0.5 text-medium-black">
                View and download your past invoices and billing receipts.
              </Text>
            </div>
          </div>

          <SettingsDropdown
            label="Filter by status"
            items={filterOptions}
            selected={filter}
            onSelect={setFilter}
            className="min-w-[160px] self-start sm:self-auto"
          />
        </div>

        {/* Summary Bar */}
        <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-light-gray/60 border border-light-gray">
          <div>
            <span className="text-[10px] font-semibold text-light-black uppercase tracking-wider block">
              Total Invoices
            </span>
            <span className="text-sm font-extrabold text-dark-black mt-0.5 block">
              {filteredInvoices.length}
            </span>
          </div>
          <div className="w-px h-8 bg-medium-black/20 hidden sm:block" />
          <div>
            <span className="text-[10px] font-semibold text-light-black uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="text-sm font-extrabold text-dark-black mt-0.5 block">
              ${(filteredInvoices.reduce((sum, invoice) => sum + invoice.amountCents, 0) / 100).toFixed(2)}
            </span>
          </div>
          <div className="w-px h-8 bg-medium-black/20 hidden sm:block" />
          <div>
            <span className="text-[10px] font-semibold text-light-black uppercase tracking-wider block">
              Latest Invoice
            </span>
            <span className="text-sm font-extrabold text-dark-black mt-0.5 block">
              {filteredInvoices[0]?.date || "—"}
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="text-[11px] font-semibold text-light-black border-b border-light-gray">
                <th className="pb-3 pr-2 font-medium">Invoice</th>
                <th className="pb-3 pr-2 font-medium">Date</th>
                <th className="pb-3 pr-2 font-medium">Description</th>
                <th className="pb-3 pr-2 font-medium">Amount</th>
                <th className="pb-3 pr-2 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-light-gray/50 transition-colors"
                  >
                    <td className="py-4 pr-2">
                      <span className="font-bold text-dark-black">
                        {invoice.id}
                      </span>
                    </td>
                    <td className="py-4 pr-2 text-medium-black font-medium">
                      {invoice.date}
                    </td>
                    <td className="py-4 pr-2 text-medium-black font-medium">
                      {invoice.description}
                    </td>
                    <td className="py-4 pr-2">
                      <span className="font-extrabold text-dark-black">
                        {invoice.amount}
                      </span>
                    </td>
                    <td className="py-4 pr-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          statusStyles[invoice.status] ||
                          "bg-light-gray text-medium-black"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-light-gray text-medium-black hover:bg-primary hover:text-white hover:border-primary text-[10px] font-semibold rounded-lg transition-all duration-300 cursor-pointer"
                      >
                        <FiDownload className="w-3 h-3" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FiSearch className="w-6 h-6 text-light-black" />
                      <Text variant="small" className="text-light-black font-medium">
                        {invoices.length ? "No invoices found for this filter." : "No invoices yet. They appear here after your first payment."}
                      </Text>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Notice */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-light-black">
          <FiFileText className="w-3.5 h-3.5 text-light-black flex-shrink-0" />
          <span>
            Invoices are generated at the end of each billing cycle. Need a
            custom receipt?{" "}
            <a href="#" className="font-semibold text-primary hover:underline">
              Contact support.
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

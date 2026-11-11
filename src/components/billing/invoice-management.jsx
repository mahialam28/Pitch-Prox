"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText, Search, X } from "lucide-react";
import { apiRequest, formatDate } from "@/lib/client-api";
import { usePortal } from "@/components/shared/use-portal";

// ── Invoice Management (Billing page, Super Admin + Sales Rep) ──
// Every invoice on record (reps: their own accounts). Clicking a row opens that customer's invoice
// history. Invoices are created when payments run (Stripe), so the list stays empty until then.

const PAGE_SIZE = 6;

const STATUS_STYLES = {
  paid: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  open: "bg-sky-50 text-sky-600 border border-sky-100",
  past_due: "bg-red/10 text-red border border-red/20",
  void: "bg-light-gray text-medium-black border border-light-gray",
};
const statusLabel = (status) => String(status ?? "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[String(status).toLowerCase()] ?? STATUS_STYLES.void}`}>
    {statusLabel(status)}
  </span>
);

const emptyText = (data, searching) =>
  searching ? "No invoices match your search." : data?.paymentsConnected ? "No invoices yet." : "No invoices yet. They're created here automatically once payments (Stripe) are connected.";

function useInvoices(params) {
  const [state, setState] = useState({ data: null, error: "" });
  const key = new URLSearchParams(Object.entries(params).filter(([, value]) => value)).toString();
  useEffect(() => {
    let cancelled = false;
    apiRequest(`/api/v1/billing/invoices${key ? `?${key}` : ""}`)
      .then((data) => !cancelled && setState({ data, error: "" }))
      .catch((error) => !cancelled && setState({ data: null, error: error.message }));
    return () => {
      cancelled = true;
    };
  }, [key]);
  return state;
}

export function CustomerInvoiceHistory({ organizationId, onClose }) {
  const portal = usePortal();
  const { data, error } = useInvoices({ organizationId });
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const account = data?.account;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-black/40 backdrop-blur-xs" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="invoice-history-title" onClick={(event) => event.stopPropagation()} className="relative w-full max-w-3xl bg-white rounded-3xl border border-light-gray shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 sm:p-6 border-b border-light-gray flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="invoice-history-title" className="text-base sm:text-lg font-bold text-dark-black/80">
              Invoice history{account ? `: ${account.company}` : ""}
            </h3>
            {account && (
              <p className="text-xs text-light-black mt-0.5">
                {account.customer ?? "—"}
                {account.email ? ` · ${account.email}` : ""}
                {account.plan ? ` · ${account.plan} plan` : ""}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">
          {error && <p role="alert" className="text-sm text-red">{error}</p>}
          {!data && !error && <p className="text-sm text-light-black">Loading…</p>}
          {data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[520px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-light-black border-b border-light-gray">
                    <th className="py-2.5 font-semibold">Invoice</th>
                    <th className="py-2.5 font-semibold">Date</th>
                    <th className="py-2.5 font-semibold">Description</th>
                    <th className="py-2.5 font-semibold text-right">Amount</th>
                    <th className="py-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/60">
                  {data.results.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 font-semibold text-dark-black/80">{invoice.number}</td>
                      <td className="py-3 text-medium-black">{formatDate(invoice.issuedAt)}</td>
                      <td className="py-3 text-medium-black">{invoice.description}</td>
                      <td className="py-3 text-right font-semibold text-dark-black/80">{invoice.amount}</td>
                      <td className="py-3 text-right"><StatusBadge status={invoice.status} /></td>
                    </tr>
                  ))}
                  {data.results.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs text-light-black">{emptyText(data, false)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {account && (
          <div className="p-4 border-t border-light-gray flex justify-end">
            <Link href={`${portal.base}/users/${account.organizationId}`} className="text-xs font-semibold text-primary hover:underline">
              Open customer details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceManagement() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [historyFor, setHistoryFor] = useState(null);
  const { data, error } = useInvoices({ search: query });

  // Search after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const rows = data?.results ?? [];
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <div className="w-full h-auto min-h-[540px] xl:h-[540px] bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-light-gray/60">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">2. Invoice Management</h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-medium-black bg-light-gray rounded-full">{data?.count ?? 0}</span>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoices..."
              aria-label="Search invoices"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-light-gray/50 border border-light-gray rounded-xl focus:outline-none focus:border-primary focus:bg-white text-dark-black/80 placeholder:text-light-black"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto mt-3">
          {error && <p role="alert" className="py-6 text-center text-sm text-red">{error}</p>}
          {!error && (
            <table className="w-full text-left text-xs sm:text-sm min-w-[460px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-light-black border-b border-light-gray">
                  <th className="py-2.5 font-semibold">Invoice</th>
                  <th className="py-2.5 font-semibold">Customer</th>
                  <th className="py-2.5 font-semibold text-right">Amount</th>
                  <th className="py-2.5 font-semibold text-right">Status</th>
                  <th className="py-2.5 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/60">
                {visible.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => setHistoryFor(invoice.organizationId)}
                    onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && (event.preventDefault(), setHistoryFor(invoice.organizationId))}
                    tabIndex={0}
                    aria-label={`Open invoice history for ${invoice.company}`}
                    className="hover:bg-primary/5 cursor-pointer focus:outline-none focus-visible:bg-primary/5"
                  >
                    <td className="py-3 font-semibold text-dark-black/80">{invoice.number}</td>
                    <td className="py-3 text-medium-black">
                      <span className="block truncate max-w-[180px]">{invoice.company}</span>
                      {invoice.customer && <span className="block text-[11px] text-light-black truncate max-w-[180px]">{invoice.customer}</span>}
                    </td>
                    <td className="py-3 text-right font-semibold text-dark-black/80">{invoice.amount}</td>
                    <td className="py-3 text-right"><StatusBadge status={invoice.status} /></td>
                    <td className="py-3 text-right text-light-black">{formatDate(invoice.issuedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Outside the table so the message wraps inside the card */}
          {!error && data && rows.length === 0 && (
            <div className="py-14 px-4 text-center text-xs text-light-black leading-relaxed">
              <FileText className="w-6 h-6 mx-auto mb-2 text-light-black/60" />
              {emptyText(data, Boolean(query))}
            </div>
          )}
          {!error && !data && <p className="py-14 text-center text-xs text-light-black">Loading…</p>}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-light-gray/60 text-xs text-light-black">
            <span>
              Page {current} of {pages}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className="p-1.5 rounded-lg border border-light-gray disabled:opacity-40 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button type="button" aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)} className="p-1.5 rounded-lg border border-light-gray disabled:opacity-40 cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {historyFor && <CustomerInvoiceHistory key={historyFor} organizationId={historyFor} onClose={() => setHistoryFor(null)} />}
    </>
  );
}

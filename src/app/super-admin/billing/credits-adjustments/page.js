"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, FileText, CreditCard, AlertTriangle, FileCheck, ChevronLeft, ChevronRight, ArrowLeft, Plus, Search, Check, X, Undo2, Receipt, BadgePercent } from "lucide-react";
import Link from "next/link";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import ApplyCreditAdjustmentModal from "../components/apply-credit-adjustment-modal";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";
import { usePortal } from "@/components/shared/use-portal";
import { accountApi, decideAdjustment, money, reverseAdjustment } from "@/app/super-admin/users/account-api";

// Credits & Adjustments (Billing): every entry in the adjustments ledger. Shared by Super Admin,
// Support, Admin Manager (billing section) and sales reps (their own accounts, enforced by the API).
// A Super Admin approves or rejects pending requests and reverses applied entries.
const TYPE = {
  calls: { label: "Call Credit", icon: Phone, tone: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  reports: { label: "Report Credit", icon: FileText, tone: "bg-sky-50 text-sky-600 border-sky-100" },
  credit: { label: "Dollar Credit", icon: CreditCard, tone: "bg-teal-50 text-primary border-teal-100" },
  discount: { label: "Discount", icon: BadgePercent, tone: "bg-purple-50 text-purple-600 border-purple-100" },
  refund: { label: "Refund", icon: Receipt, tone: "bg-orange-50 text-orange-600 border-orange-100" },
};
const STATUS_TONE = {
  applied: "text-emerald-700 bg-emerald-50 border-emerald-200",
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  rejected: "text-slate-600 bg-slate-100 border-slate-200",
  reversed: "text-slate-600 bg-slate-100 border-slate-200",
};
const PAGE_SIZE = 10;
const day = (value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function CreditsAdjustmentsPage() {
  const portal = usePortal();
  const [data, setData] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [me, setMe] = useState(null);
  const [version, setVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [acting, setActing] = useState(null); // { row, action: "approve" | "reject" | "reverse" }
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiRequest("/api/v1/billing/adjustments"), apiRequest("/api/v1/me")])
      .then(([result, session]) => {
        if (cancelled) return;
        setData(result);
        setMe(session.user);
      })
      .catch((error) => showError("Adjustments not loaded", error.message));
    return () => {
      cancelled = true;
    };
  }, [version]);
  const reload = () => setVersion((value) => value + 1);

  const isSuperAdmin = me?.role === "super_admin";
  // Applying needs the customer list (Users section, or a rep's own accounts)
  const canApply = me && me.role !== "auditor" && me.role !== "admin_manager";
  const openApply = async () => {
    if (!customers) {
      try {
        setCustomers((await apiRequest("/api/v1/customers")).results);
      } catch (error) {
        return showError("Customers not loaded", error.message);
      }
    }
    setIsApplyModalOpen(true);
  };

  const rows = (data?.results ?? []).filter((row) => {
    const status = row.reversed ? "reversed" : row.status;
    if (statusFilter !== "all" && status !== statusFilter) return false;
    const query = searchQuery.trim().toLowerCase();
    return !query || `${row.reference} ${row.company} ${row.reason} ${TYPE[row.kind]?.label} ${row.requestedBy}`.toLowerCase().includes(query);
  });
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const currentRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const stats = data?.stats;

  const kpis = [
    { id: "total", title: "TOTAL ADJUSTMENTS", value: data ? data.results.length : "—", subtitle: `${stats?.addedThisMonth ?? 0} added this month`, icon: FileCheck, iconBg: "bg-emerald-50 text-emerald-600" },
    { id: "credits", title: "ACCOUNT CREDITS", value: stats ? money(stats.creditsThisMonthCents) : "—", subtitle: "Issued this month", icon: CreditCard, iconBg: "bg-light-teal text-primary" },
    { id: "calls", title: "CALL CREDITS", value: stats ? stats.callsThisMonth.toLocaleString() : "—", subtitle: "Added this month", icon: Phone, iconBg: "bg-emerald-50 text-emerald-600" },
    { id: "reports", title: "REPORT CREDITS", value: stats ? stats.reportsThisMonth.toLocaleString() : "—", subtitle: "Added this month", icon: FileText, iconBg: "bg-sky-50 text-sky-600" },
    { id: "pending", title: "PENDING APPROVAL", value: stats ? stats.pending : "—", subtitle: isSuperAdmin ? "Requires your review" : "Waiting for a Super Admin", icon: AlertTriangle, iconBg: "bg-orange-50 text-orange-600" },
  ];

  const confirm = async () => {
    const row = acting?.row;
    const action = acting?.action;
    if (!row) return;
    if (action === "reverse") await reverseAdjustment(row.id, note.trim());
    else await decideAdjustment(row.id, action, note.trim() || undefined);
    showSavedToast(action === "reverse" ? "Adjustment reversed" : action === "approve" ? "Adjustment approved" : "Adjustment rejected", `${row.reference}: ${row.value}`);
    setNote("");
    reload();
  };

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-light-black">
            <Link href={`${portal.base}/billing`} className="hover:text-primary transition-colors cursor-pointer">
              Billing
            </Link>
            <span>/</span>
            <span className="text-dark-black/85 font-semibold">Credits & Adjustments</span>
          </div>
          <Link
            href={`${portal.base}/billing`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black/85 hover:bg-light-gray hover:text-primary transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Billing</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full flex flex-col gap-1 min-w-0">
            <Title variant="small" className="!text-dark-black/90 font-bold">
              Credits & Adjustments
            </Title>
            <Text variant="small" className="text-medium-black">
              Every credit, discount and refund is kept in the ledger. Mistakes are undone with a reversal, never edited.
            </Text>
          </div>
          {canApply && (
            <button
              type="button"
              onClick={openApply}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Credit / Adjustment</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpis.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">{card.title}</span>
                    <span className="text-2xl font-bold text-dark-black/85 tracking-tight mt-0.5">{card.value}</span>
                    <span className="text-[11px] font-medium text-light-black mt-0.5">{card.subtitle}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col justify-between min-h-[500px]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-light-gray/60 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64 sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-black" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search adjustments..."
                  aria-label="Search adjustments"
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-light-gray rounded-xl text-dark-black/85 placeholder:text-light-black/60 focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Status"
                className="h-9 px-3 rounded-xl border border-light-gray text-xs bg-white outline-none focus:border-primary"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="applied">Applied</option>
                <option value="rejected">Rejected</option>
                <option value="reversed">Reversed</option>
              </select>
            </div>
            <span className="text-xs text-light-black font-medium">{rows.length} adjustments</span>
          </div>

          <div className="w-full flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                  <th className="py-3 px-3 font-semibold">Adjustment ID</th>
                  <th className="py-3 px-3 font-semibold">Company</th>
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 font-semibold">Value</th>
                  <th className="py-3 px-3 font-semibold">Reason</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  {isSuperAdmin && <th className="py-3 px-3 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/40 text-xs">
                {currentRows.map((row) => {
                  const type = TYPE[row.kind] ?? TYPE.credit;
                  const Icon = type.icon;
                  const status = row.reversed ? "reversed" : row.status;
                  return (
                    <tr key={row.id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-dark-black/80 font-mono whitespace-nowrap">{row.reference}</td>
                      <td className="py-3.5 px-3 font-semibold text-dark-black/85 whitespace-nowrap">
                        <Link href={`${portal.base}/users/${row.organizationId}?tab=subscription`} className="hover:text-primary hover:underline">
                          {row.company}
                        </Link>
                        <span className="block text-[11px] font-normal text-light-black">by {row.requestedBy}</span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${type.tone}`}>
                          <Icon className="w-3 h-3" />
                          {row.isReversal ? "Reversal" : type.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-dark-black/85 whitespace-nowrap">{row.value}</td>
                      <td className="py-3.5 px-3 text-medium-black max-w-[220px] truncate" title={row.reason}>
                        {row.reason}
                      </td>
                      <td className="py-3.5 px-3 text-medium-black whitespace-nowrap">{day(row.createdAt)}</td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold capitalize ${STATUS_TONE[status]}`}>{status}</span>
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          {row.status === "pending" && (
                            <span className="inline-flex gap-1.5">
                              <button type="button" onClick={() => setActing({ row, action: "approve" })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold cursor-pointer">
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button type="button" onClick={() => setActing({ row, action: "reject" })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-light-gray text-medium-black hover:bg-light-gray font-semibold cursor-pointer">
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </span>
                          )}
                          {row.status === "applied" && !row.reversed && !row.isReversal && (
                            <button type="button" onClick={() => setActing({ row, action: "reverse" })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-light-gray text-medium-black hover:bg-light-gray font-semibold cursor-pointer">
                              <Undo2 className="w-3 h-3" /> Reverse
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {!currentRows.length && (
                  <tr>
                    <td colSpan={isSuperAdmin ? 8 : 7} className="py-12 text-center text-medium-black">
                      {data ? (data.results.length ? "No adjustments match your search." : "No credits or adjustments yet.") : "Loading…"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-light-gray/60 text-xs text-medium-black mt-4">
            <div>
              Showing {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, rows.length)} of {rows.length} adjustments
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous page" onClick={() => setCurrentPage(page - 1)} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-light-gray disabled:opacity-50 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setCurrentPage(number)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold cursor-pointer ${page === number ? "bg-primary text-white shadow-xs" : "text-medium-black hover:bg-light-gray"}`}
                >
                  {number}
                </button>
              ))}
              <button type="button" aria-label="Next page" onClick={() => setCurrentPage(page + 1)} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-light-gray disabled:opacity-50 cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isApplyModalOpen && (
        <ApplyCreditAdjustmentModal
          isOpen
          onClose={() => setIsApplyModalOpen(false)}
          customers={customers ?? []}
          canRefund={isSuperAdmin}
          onApply={async (organizationId, body) => {
            const entry = await accountApi(organizationId).adjust(body);
            reload();
            return entry;
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(acting)}
        onClose={() => {
          setActing(null);
          setNote("");
        }}
        title={acting?.action === "reverse" ? "Reverse this adjustment?" : acting?.action === "approve" ? "Approve this request?" : "Reject this request?"}
        message={acting ? `${acting.row.reference}: ${acting.row.value} for ${acting.row.company}.` : ""}
        note={acting?.action === "reverse" ? "A new, opposite entry is added. The original stays in the ledger." : undefined}
        confirmLabel={acting?.action === "reverse" ? "Reverse" : acting?.action === "approve" ? "Approve" : "Reject"}
        confirmVariant={acting?.action === "approve" ? "primary" : "danger"}
        confirmDisabled={acting?.action === "reverse" && !note.trim()}
        onConfirm={confirm}
      >
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-medium-black">
          {acting?.action === "reverse" ? "Reason" : "Note (optional)"}
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-light-gray text-sm outline-none focus:border-primary" />
        </label>
      </ConfirmDialog>
    </>
  );
}

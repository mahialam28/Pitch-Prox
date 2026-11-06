"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { ProfileAvatar } from "@/components/shared/avatar-editor";
import { loadRepActivity } from "../../team-api";

// Live: what the rep did and what was done to their profile, from the audit log (lib/sales-team → repActivity)
const activityTypeOptions = [
  { value: "", label: "All Activity Types" },
  { value: "Accounts", label: "Customer Accounts" },
  { value: "Support", label: "Support Tickets" },
  { value: "Profile", label: "Profile & Settings" },
  { value: "Coaching", label: "Coaching & Quotas" },
  { value: "Onboarding", label: "Onboarding & Training" },
];

const pageSizeOptions = [
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
  { value: "50", label: "50 / page" },
];

const CATEGORY_COLORS = {
  Accounts: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  Support: "bg-blue-50 text-blue-600 border border-blue-200",
  Profile: "bg-purple-50 text-purple-600 border border-purple-200",
  Coaching: "bg-amber-50 text-amber-700 border border-amber-200",
  Onboarding: "bg-slate-100 text-slate-600 border border-slate-200",
  Other: "bg-slate-100 text-slate-600 border border-slate-200",
};

// "customer.created" → "Customer created"
const activityName = (action) => {
  const text = action.split(".").pop().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default function ActivityLogTab({ rep }) {
  const repName = rep?.name ?? "";
  const performedByOptions = [
    { value: "", label: "All Performed By" },
    { value: "self", label: `${repName} (Self)` },
    { value: "others", label: "Managers / System" },
  ];

  const [activityType, setActivityType] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const params = { page: currentPage, pageSize, ...(activityType && { category: activityType }), ...(performedBy && { performedBy }) };
    loadRepActivity(rep.id, params)
      .then((result) => !cancelled && (setData(result), setError(null)))
      .catch((failure) => !cancelled && setError(failure.message));
    return () => {
      cancelled = true;
    };
  }, [rep.id, currentPage, pageSize, activityType, performedBy]);

  const rows = data?.results ?? [];
  const pages = data?.pages ?? 1;
  const filter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-light-gray shadow-xs flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight">Activity Log</h2>
          <p className="text-xs sm:text-sm text-light-black mt-0.5">Track all actions and changes made in {repName}&apos;s account.</p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="w-48">
            <Dropdown items={activityTypeOptions} selected={activityType} onSelect={filter(setActivityType)} variant="small" placement="bottom" className="w-full" />
          </div>
          <div className="w-48">
            <Dropdown items={performedByOptions} selected={performedBy} onSelect={filter(setPerformedBy)} variant="small" placement="bottom" className="w-full" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-light-gray text-[10.5px] font-bold text-light-black uppercase tracking-wider select-none">
              <th className="pb-3 text-left">DATE / TIME</th>
              <th className="pb-3 text-left">ACTIVITY</th>
              <th className="pb-3 text-left">CATEGORY</th>
              <th className="pb-3 text-left">DETAILS</th>
              <th className="pb-3 text-left">PERFORMED BY</th>
              <th className="pb-3 text-right">IP ADDRESS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {!rows.length && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-light-black">
                  {error ?? (data ? "No activity yet." : "Loading…")}
                </td>
              </tr>
            )}
            {rows.map((item) => {
              const created = new Date(item.createdAt);
              return (
                <tr key={item.id} className="hover:bg-light-gray/40 transition-colors">
                  <td className="py-3.5 pr-3 text-left whitespace-nowrap">
                    <p className="font-semibold text-dark-black/85 text-xs">{created.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    <p className="text-[11px] text-light-black mt-0.5">{created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                  </td>
                  <td className="py-3.5 pr-3 text-left whitespace-nowrap">
                    <span className="font-bold text-dark-black/90 text-xs">{activityName(item.action)}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-left whitespace-nowrap">
                    <span className={`inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other}`}>{item.category}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-left text-light-black text-xs">{item.summary}</td>
                  <td className="py-3.5 pr-3 text-left whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ProfileAvatar name={item.actorName ?? "System"} className="w-6 h-6 !text-[9px] !border" />
                      <span className="font-bold text-dark-black/90 text-xs">{item.actorName ?? "System"}</span>
                      <span className="text-[11px] text-light-black">{item.self ? "(Self)" : ""}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap text-light-black text-xs font-mono">{item.ip ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-light-gray select-none">
        <span className="text-xs text-light-black">
          {data?.total ? `Showing ${(data.page - 1) * data.pageSize + 1} to ${Math.min(data.page * data.pageSize, data.total)} of ${data.total} activities` : "No activities"}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-light-black px-2">Page {currentPage} of {pages}</span>
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= pages}
              onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
              className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-28">
            <Dropdown items={pageSizeOptions} selected={pageSize} onSelect={filter(setPageSize)} variant="small" placement="top" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserX,
  Eye,
  Pencil,
  RotateCcw,
  Target,
  Mail,
  Ban,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import EditRepModal from "../[id]/components/edit-rep-modal";
import { DeactivateRepModal } from "./sales-rep-modals";
import { showSavedToast } from "@/lib/toast";
import { showError } from "@/lib/alerts";
import { ProfileAvatar } from "@/components/shared/avatar-editor";
import { TIER_STYLES, dollars, lastActive, pct, rosterStatus, trend, updateRep } from "../team-api";

const pageSizeOptions = [
  { value: "10 / page", label: "10 / page" },
  { value: "20 / page", label: "20 / page" },
  { value: "50 / page", label: "50 / page" },
];

// Live roster: one row per sales rep with this month's numbers (lib/sales-team)
export default function SalesRepsTable({ reps = [], managers = [], canManage = false, onChanged, onAdjustQuota }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10 / page");
  const [sortAsc, setSortAsc] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deactivating, setDeactivating] = useState(null);

  const setStatus = async (rep, status) => {
    try {
      await updateRep(rep.id, { status });
      showSavedToast(status === "deactivated" ? "Rep deactivated" : "Rep reactivated", status === "deactivated" ? `${rep.name} was signed out and removed from quota tracking.` : `${rep.name} can sign in again.`);
      onChanged?.();
    } catch (error) {
      showError("Couldn't update the rep", error.message);
    }
  };

  const repMenuItems = (rep) => [
    { label: "View Profile", icon: Eye, onClick: () => router.push(`/super-admin/sales-reps/${rep.id}`) },
    ...(canManage
      ? [
          { label: "Edit Profile", icon: Pencil, onClick: () => setEditing(rep) },
          { label: "Adjust Quota", icon: Target, disabled: rep.status === "deactivated", onClick: () => onAdjustQuota?.(rep) },
        ]
      : []),
    { label: "Send Message", icon: Mail, onClick: () => router.push(`/super-admin/mail?to=${encodeURIComponent(rep.email)}`) },
    ...(canManage
      ? [
          { divider: true },
          rep.status === "deactivated"
            ? { label: "Reactivate Rep", icon: RotateCcw, onClick: () => setStatus(rep, "active") }
            : { label: "Deactivate Rep", icon: Ban, danger: true, onClick: () => setDeactivating(rep) },
        ]
      : []),
  ];

  const size = Number.parseInt(pageSize, 10);
  const query = searchTerm.toLowerCase();
  const filteredReps = reps
    .filter((rep) =>
      [rep.name, rep.email, rep.employeeId ?? "", rep.jobTitle, rep.managerName ?? ""].some((value) => value.toLowerCase().includes(query))
    )
    .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  const pages = Math.max(1, Math.ceil(filteredReps.length / size));
  const page = Math.min(currentPage, pages);
  const visible = filteredReps.slice((page - 1) * size, page * size);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by rep name, email, or manager..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* Table Section */}
      {filteredReps.length > 0 ? (
        <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse min-w-[1360px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider select-none">
                {/* Rep Name with Sort Toggle */}
                <th
                  onClick={() => setSortAsc(!sortAsc)}
                  className="pb-3 text-left cursor-pointer hover:text-dark-black/80 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>SALES REP</span>
                    <ArrowUpDown className="w-3 h-3 text-light-black" />
                  </div>
                </th>

                <th className="pb-3 px-4 text-left">EMPLOYEE ID</th>

                <th className="pb-3 px-4 text-left">
                  <div className="flex items-center gap-1">
                    <span>LEAD TO SUBSCRIPTION</span>
                  </div>
                </th>

                <th className="pb-3 px-4 text-left">
                  <div className="flex items-center gap-1">
                    <span>PROMPT ADHERENCE</span>
                  </div>
                </th>

                <th className="pb-3 px-4 text-left">
                  <div className="flex items-center gap-1">
                    <span>TRUST GAIN</span>
                  </div>
                </th>

                <th className="pb-3 px-4 text-left">
                  <div className="flex items-center gap-1">
                    <span>QUOTA PROGRESS</span>
                  </div>
                </th>

                <th className="pb-3 px-4 text-left">LAST ACTIVE</th>
                <th className="pb-3 px-4 text-left">MANAGER</th>
                <th className="pb-3 px-4 text-right">STATUS</th>
                <th className="pb-3 px-4 w-10"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-light-gray/60 text-xs">
              {visible.map((rep) => {
                const status = rosterStatus(rep);
                const leadTrend = trend(rep.closed, rep.closedPrev);
                return (
                <tr
                  key={rep.id}
                  onClick={() => router.push(`/super-admin/sales-reps/${rep.id}`)}
                  className="hover:bg-light-gray/40 transition-colors group cursor-pointer"
                >
                  {/* Sales Rep (Avatar + Name & Subtitle) */}
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar name={rep.name} className="w-9 h-9 !text-xs shrink-0" />
                      <div>
                        <p className="font-semibold text-dark-black/85 text-xs leading-tight whitespace-nowrap group-hover:text-primary transition-colors">
                          {rep.name}
                        </p>
                        <p className="text-[11px] text-light-black font-normal mt-0.5 whitespace-nowrap">
                          {rep.jobTitle}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Employee ID */}
                  <td className="py-4 px-4 text-left text-xs font-normal text-light-black whitespace-nowrap">
                    {rep.employeeId ?? "—"}
                  </td>

                  {/* Lead to Subscription */}
                  <td className="py-4 px-4 text-left whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-dark-black/85 text-xs">
                        {pct(rep.leadToSubscription)}
                      </p>
                      <p className={`text-[10px] font-medium mt-0.5 ${leadTrend.positive === true ? "text-emerald-600" : leadTrend.positive === false ? "text-rose-500" : "text-light-black"}`}>
                        {rep.closed} closed this month
                      </p>
                    </div>
                  </td>

                  {/* Prompt Adherence */}
                  <td className="py-4 px-4 text-left whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-dark-black/85 text-xs">
                        —
                      </p>
                      <p className="text-[10px] font-medium mt-0.5 text-light-black">Needs call data</p>
                    </div>
                  </td>

                  {/* Trust Gain */}
                  <td className="py-4 px-4 text-left whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-dark-black/85 text-xs">
                        —
                      </p>
                      <p className="text-[10px] font-medium mt-0.5 text-light-black">Needs call data</p>
                    </div>
                  </td>

                  {/* Quota Progress (Bar + Count) */}
                  <td className="py-4 px-4 text-left whitespace-nowrap">
                    <div className="w-28 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-dark-black/85">
                        {rep.quotaCents == null ? "No quota" : `${rep.attainment}%`}
                      </span>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${TIER_STYLES[rep.tier]?.bar ?? "bg-slate-300"}`}
                          style={{
                            width: `${Math.min(100, rep.attainment ?? 0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-light-black font-normal">
                        {dollars(rep.revenueCents)} / {dollars(rep.quotaCents)}
                      </span>
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="py-4 px-4 text-left whitespace-nowrap text-xs text-light-black font-normal">
                    {lastActive(rep.lastActiveAt)}
                  </td>

                  {/* Manager */}
                  <td className="py-4 px-4 text-left whitespace-nowrap text-xs text-dark-black/75 font-normal">
                    {rep.managerName ?? "—"}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${status.badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      />
                      <span>{status.label}</span>
                    </span>
                  </td>

                  {/* Row actions */}
                  <td className="py-4 px-4 pl-2 text-right" onClick={(event) => event.stopPropagation()}>
                    <ActionMenu label={`Actions for ${rep.name}`} items={repMenuItems(rep)} />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-light-gray/40 border border-dashed border-light-gray my-2">
          <div className="w-12 h-12 rounded-2xl bg-light-gray flex items-center justify-center text-light-black mb-2.5">
            <UserX className="w-6 h-6 text-light-black" />
          </div>
          <h4 className="text-sm font-bold text-dark-black/80">
            No sales rep found
          </h4>
          <p className="text-xs text-light-black mt-1 max-w-xs leading-relaxed">
            {searchTerm ? <>No representative matches &quot;{searchTerm}&quot;. Try adjusting your search query.</> : "Sales reps appear here once they're added in Access Records."}
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Pagination Footer using shared Dropdown and theme styling */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-2 border-t border-light-gray select-none">
        <span className="text-xs text-light-black font-normal">
          {filteredReps.length ? `Showing ${(page - 1) * size + 1} to ${Math.min(page * size, filteredReps.length)} of ${filteredReps.length} sales reps` : "No sales reps"}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setCurrentPage(page - 1)}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pages }, (_, index) => index + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  page === pageNum
                    ? "bg-primary text-white shadow-xs"
                    : "text-dark-black/75 hover:bg-light-gray"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              aria-label="Next page"
              disabled={page === pages}
              onClick={() => setCurrentPage(page + 1)}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Size Dropdown using Shared Dropdown Component */}
          <div className="w-28">
            <Dropdown
              items={pageSizeOptions}
              selected={pageSize}
              onSelect={(val) => { setPageSize(val); setCurrentPage(1); }}
              variant="small"
              placement="top"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {editing && (
        <EditRepModal
          key={editing.id}
          isOpen
          rep={editing}
          managers={managers}
          onClose={() => setEditing(null)}
          onSave={async (changes) => {
            await updateRep(editing.id, changes);
            onChanged?.();
          }}
        />
      )}
      <DeactivateRepModal
        rep={deactivating}
        onClose={() => setDeactivating(null)}
        onConfirm={(rep) => setStatus(rep, "deactivated")}
      />
    </div>
  );
}

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
  User,
  Target,
  Mail,
  Ban,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import EditRepModal from "../[id]/components/edit-rep-modal";
import ImpersonateRepModal from "../[id]/components/impersonate-rep-modal";
import AdjustQuotaModal from "./adjust-quota-modal";
import { DeactivateRepModal } from "./sales-rep-modals";
import { showSavedToast } from "@/lib/toast";

const DEACTIVATED_STATUS = {
  status: "Deactivated",
  statusBadge: "bg-slate-100 text-slate-500 border-slate-200",
  statusDot: "bg-slate-400",
};

// Fills the fields the profile modals expect; the roster only carries table columns.
const toProfile = (rep) => ({
  ...rep,
  email: `${rep.name.toLowerCase().replace(/[^a-z]+/g, ".")}@pitchprox.com`,
  phone: "(512) 555-0198",
  hireDate: "Jan 10, 2024",
  timeZone: "(GMT-05:00) Eastern Time",
});

const repsData = [
  {
    id: "EMP-1001",
    name: "Ryan Anderson",
    role: "Senior Closer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
    employeeId: "EMP-1001",
    leadToSub: "34.2%",
    leadTrend: "^ 6.1%",
    leadPositive: true,
    promptAdh: "92.1%",
    promptTrend: "^ 4.3%",
    promptPositive: true,
    trustGain: "+28.7",
    trustTrend: "^ 3.2",
    trustPositive: true,
    quotaPercent: "112%",
    quotaFill: 100,
    quotaCount: "56 / 50",
    quotaColor: "bg-emerald-500",
    lastActive: "Today, 10:32 AM",
    manager: "Alex Johnson",
    status: "Active",
    statusBadge: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    statusDot: "bg-emerald-500",
  },
  {
    id: "EMP-1002",
    name: "David Martinez",
    role: "Closer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120",
    employeeId: "EMP-1002",
    leadToSub: "29.8%",
    leadTrend: "^ 3.2%",
    leadPositive: true,
    promptAdh: "89.4%",
    promptTrend: "^ 2.1%",
    promptPositive: true,
    trustGain: "+22.4",
    trustTrend: "^ 1.8",
    trustPositive: true,
    quotaPercent: "94%",
    quotaFill: 94,
    quotaCount: "47 / 50",
    quotaColor: "bg-emerald-500",
    lastActive: "Today, 9:15 AM",
    manager: "Emily Smith",
    status: "Active",
    statusBadge: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    statusDot: "bg-emerald-500",
  },
  {
    id: "EMP-1003",
    name: "Michael Carter",
    role: "Closing Specialist",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120",
    employeeId: "EMP-1003",
    leadToSub: "25.7%",
    leadTrend: "^ 2.4%",
    leadPositive: true,
    promptAdh: "84.7%",
    promptTrend: "^ 4.7%",
    promptPositive: true,
    trustGain: "+19.3",
    trustTrend: "^ 1.1",
    trustPositive: true,
    quotaPercent: "78%",
    quotaFill: 78,
    quotaCount: "39 / 50",
    quotaColor: "bg-amber-500",
    lastActive: "Today, 8:47 AM",
    manager: "Michael Brown",
    status: "Active",
    statusBadge: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    statusDot: "bg-emerald-500",
  },
  {
    id: "EMP-1004",
    name: "Emily Davis",
    role: "Closer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
    employeeId: "EMP-1004",
    leadToSub: "22.1%",
    leadTrend: "^ 1.6%",
    leadPositive: true,
    promptAdh: "78.2%",
    promptTrend: "v 1.3%",
    promptPositive: false,
    trustGain: "+16.8",
    trustTrend: "v 0.6",
    trustPositive: false,
    quotaPercent: "62%",
    quotaFill: 62,
    quotaCount: "31 / 50",
    quotaColor: "bg-amber-400",
    lastActive: "Yesterday, 4:32 PM",
    manager: "Sarah Davis",
    status: "Offline",
    statusBadge: "bg-slate-100 text-slate-600 border-slate-200",
    statusDot: "bg-slate-400",
  },
  {
    id: "EMP-1005",
    name: "David Martinez",
    role: "Closer",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120",
    employeeId: "EMP-1005",
    leadToSub: "18.9%",
    leadTrend: "v 0.3%",
    leadPositive: false,
    promptAdh: "72.6%",
    promptTrend: "v 3.2%",
    promptPositive: false,
    trustGain: "+14.2",
    trustTrend: "v 1.4",
    trustPositive: false,
    quotaPercent: "48%",
    quotaFill: 48,
    quotaCount: "24 / 50",
    quotaColor: "bg-rose-400",
    lastActive: "Yesterday, 2:18 PM",
    manager: "David Wilson",
    status: "At Risk",
    statusBadge: "bg-rose-50 text-rose-600 border-rose-200",
    statusDot: "bg-rose-500",
  },
  {
    id: "EMP-1006",
    name: "David Martinez",
    role: "Closer",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
    employeeId: "EMP-1006",
    leadToSub: "15.4%",
    leadTrend: "v 2.1%",
    leadPositive: false,
    promptAdh: "65.3%",
    promptTrend: "v 5.4%",
    promptPositive: false,
    trustGain: "+11.7",
    trustTrend: "v 1.2",
    trustPositive: false,
    quotaPercent: "36%",
    quotaFill: 36,
    quotaCount: "18 / 50",
    quotaColor: "bg-rose-500",
    lastActive: "May 15, 6:05 PM",
    manager: "Jessica Taylor",
    status: "At Risk",
    statusBadge: "bg-rose-50 text-rose-600 border-rose-200",
    statusDot: "bg-rose-500",
  },
  {
    id: "EMP-1007",
    name: "Jonathan White",
    role: "Closing Specialist",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120",
    employeeId: "EMP-1007",
    leadToSub: "31.6%",
    leadTrend: "^ 4.8%",
    leadPositive: true,
    promptAdh: "90.2%",
    promptTrend: "^ 6.3%",
    promptPositive: true,
    trustGain: "+25.1",
    trustTrend: "^ 2.9",
    trustPositive: true,
    quotaPercent: "107%",
    quotaFill: 100,
    quotaCount: "53 / 50",
    quotaColor: "bg-emerald-500",
    lastActive: "Today, 11:02 AM",
    manager: "Daniel Martine",
    status: "In Meeting",
    statusBadge: "bg-blue-50 text-blue-600 border-blue-200",
    statusDot: "bg-blue-500",
  },
  {
    id: "EMP-1008",
    name: "Jessica Lee",
    role: "Sales Rep",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120",
    employeeId: "EMP-1008",
    leadToSub: "0.0%",
    leadTrend: null,
    leadPositive: null,
    promptAdh: "0.0%",
    promptTrend: null,
    promptPositive: null,
    trustGain: "0.0",
    trustTrend: null,
    trustPositive: null,
    quotaPercent: "0%",
    quotaFill: 0,
    quotaCount: "0 / 50",
    quotaColor: "bg-slate-300",
    lastActive: "May 10, 2025",
    manager: "Sophia Anderson",
    status: "On Leave",
    statusBadge: "bg-purple-50 text-purple-600 border-purple-200",
    statusDot: "bg-purple-500",
  },
];

const pageSizeOptions = [
  { value: "10 / page", label: "10 / page" },
  { value: "20 / page", label: "20 / page" },
  { value: "50 / page", label: "50 / page" },
];

export default function SalesRepsTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10 / page");
  const [sortAsc, setSortAsc] = useState(true);
  // Design only: edits and deactivations live in local state
  const [overrides, setOverrides] = useState({});
  const [editing, setEditing] = useState(null);
  const [impersonating, setImpersonating] = useState(null);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(null);

  const updateRep = (id, changes) => setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...changes } }));

  const repMenuItems = (rep) => [
    { label: "View Profile", icon: Eye, onClick: () => router.push(`/super-admin/sales-reps/${rep.id}`) },
    { label: "Edit Profile", icon: Pencil, onClick: () => setEditing(toProfile(rep)) },
    { label: "Impersonate Rep", icon: User, onClick: () => setImpersonating(toProfile(rep)) },
    { label: "Adjust Quota", icon: Target, onClick: () => setQuotaOpen(true) },
    { label: "Send Message", icon: Mail, onClick: () => router.push("/super-admin/mail") },
    { divider: true },
    { label: "Deactivate Rep", icon: Ban, danger: true, disabled: rep.status === "Deactivated", onClick: () => setDeactivating(rep) },
  ];

  const filteredReps = repsData
    .map((rep) => ({ ...rep, ...overrides[rep.id] }))
    .filter((rep) => {
      const query = searchTerm.toLowerCase();
      return (
        rep.name.toLowerCase().includes(query) ||
        rep.employeeId.toLowerCase().includes(query) ||
        rep.role.toLowerCase().includes(query) ||
        rep.manager.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      return sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

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
          <table className="w-full text-left border-collapse min-w-[960px]">
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

                <th className="pb-3 text-left">EMPLOYEE ID</th>

                <th className="pb-3 text-left">
                  <div className="flex items-center gap-1">
                    <span>LEAD TO SUBSCRIPTION</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-light-black/50 inline-block" />
                  </div>
                </th>

                <th className="pb-3 text-left">
                  <div className="flex items-center gap-1">
                    <span>PROMPT ADHERENCE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-light-black/50 inline-block" />
                  </div>
                </th>

                <th className="pb-3 text-left">
                  <div className="flex items-center gap-1">
                    <span>TRUST GAIN</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-light-black/50 inline-block" />
                  </div>
                </th>

                <th className="pb-3 text-left">
                  <div className="flex items-center gap-1">
                    <span>QUOTA PROGRESS</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-light-black/50 inline-block" />
                  </div>
                </th>

                <th className="pb-3 text-left">LAST ACTIVE</th>
                <th className="pb-3 text-left">MANAGER</th>
                <th className="pb-3 text-right">STATUS</th>
                <th className="pb-3 w-10"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-light-gray/60 text-xs">
              {filteredReps.map((rep) => (
                <tr
                  key={rep.id}
                  onClick={() => router.push(`/super-admin/sales-reps/${rep.id}`)}
                  className="hover:bg-light-gray/40 transition-colors group cursor-pointer"
                >
                  {/* Sales Rep (Avatar + Name & Subtitle) */}
                  <td className="py-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-light-gray bg-slate-100 relative">
                        <img
                          src={rep.avatar}
                          alt={rep.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-dark-black/85 text-xs leading-tight whitespace-nowrap group-hover:text-primary transition-colors">
                          {rep.name}
                        </p>
                        <p className="text-[11px] text-light-black font-normal mt-0.5 whitespace-nowrap">
                          {rep.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Employee ID */}
                  <td className="py-3 text-left text-xs font-normal text-light-black whitespace-nowrap">
                    {rep.employeeId}
                  </td>

                  {/* Lead to Subscription */}
                  <td className="py-3 text-left whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-dark-black/85 text-xs">
                        {rep.leadToSub}
                      </p>
                      {rep.leadTrend && (
                        <p
                          className={`text-[10px] font-medium mt-0.5 ${
                            rep.leadPositive
                              ? "text-emerald-600"
                              : "text-rose-500"
                          }`}
                        >
                          {rep.leadTrend}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Prompt Adherence */}
                  <td className="py-3 text-left whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-dark-black/85 text-xs">
                        {rep.promptAdh}
                      </p>
                      {rep.promptTrend && (
                        <p
                          className={`text-[10px] font-medium mt-0.5 ${
                            rep.promptPositive
                              ? "text-emerald-600"
                              : "text-rose-500"
                          }`}
                        >
                          {rep.promptTrend}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Trust Gain */}
                  <td className="py-3 text-left whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-dark-black/85 text-xs">
                        {rep.trustGain}
                      </p>
                      {rep.trustTrend && (
                        <p
                          className={`text-[10px] font-medium mt-0.5 ${
                            rep.trustPositive
                              ? "text-emerald-600"
                              : "text-rose-500"
                          }`}
                        >
                          {rep.trustTrend}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Quota Progress (Bar + Count) */}
                  <td className="py-3 text-left whitespace-nowrap">
                    <div className="w-28 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-dark-black/85">
                        {rep.quotaPercent}
                      </span>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${rep.quotaColor}`}
                          style={{
                            width: `${Math.min(100, rep.quotaFill)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-light-black font-normal">
                        {rep.quotaCount}
                      </span>
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="py-3 text-left whitespace-nowrap text-xs text-light-black font-normal">
                    {rep.lastActive}
                  </td>

                  {/* Manager */}
                  <td className="py-3 text-left whitespace-nowrap text-xs text-dark-black/75 font-normal">
                    {rep.manager}
                  </td>

                  {/* Status */}
                  <td className="py-3 text-right whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${rep.statusBadge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${rep.statusDot}`}
                      />
                      <span>{rep.status}</span>
                    </span>
                  </td>

                  {/* Row actions */}
                  <td className="py-3 pl-2 text-right" onClick={(event) => event.stopPropagation()}>
                    <ActionMenu label={`Actions for ${rep.name}`} items={repMenuItems(rep)} />
                  </td>
                </tr>
              ))}
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
            No representative matches &quot;{searchTerm}&quot;. Try adjusting your search query.
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
          Showing 1 to {filteredReps.length} of 48 sales reps
        </span>

        <div className="flex items-center gap-3">
          {/* Page Number Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3, 4, 5].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary text-white shadow-xs"
                    : "text-dark-black/75 hover:bg-light-gray"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <span className="text-xs text-light-black px-1 font-semibold">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(6)}
              className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 6
                  ? "bg-primary text-white shadow-xs"
                  : "text-dark-black/75 hover:bg-light-gray"
              }`}
            >
              6
            </button>

            <button
              type="button"
              disabled={currentPage === 6}
              onClick={() => setCurrentPage((p) => Math.min(6, p + 1))}
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
              onSelect={(val) => setPageSize(val)}
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
          onClose={() => setEditing(null)}
          onSave={(data) => updateRep(editing.id, { name: data.name, role: data.role, avatar: data.avatar, manager: data.manager })}
        />
      )}
      <ImpersonateRepModal isOpen={Boolean(impersonating)} rep={impersonating} onClose={() => setImpersonating(null)} />
      <AdjustQuotaModal isOpen={quotaOpen} onClose={() => setQuotaOpen(false)} />
      <DeactivateRepModal
        rep={deactivating}
        onClose={() => setDeactivating(null)}
        onConfirm={(rep) => {
          updateRep(rep.id, DEACTIVATED_STATUS);
          showSavedToast("Rep deactivated", `${rep.name} was removed from leaderboards and quota tracking.`);
        }}
      />
    </div>
  );
}

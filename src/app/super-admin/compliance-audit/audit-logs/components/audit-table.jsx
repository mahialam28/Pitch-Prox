"use client";

import React from "react";
import { Search, Download } from "lucide-react";
import Pagination from "@/components/shared/pagination/pagination";
import { auditTabs } from "../audit-logs-data";

const PAGE_SIZES = [10, 25, 50, 100].map((size) => ({ value: `${size} / page`, label: `${size} / page` }));

const CATEGORY_STYLES = {
  security: "bg-[#ECFDF5] text-[#10B981]",
  billing: "bg-[#FEF3EB] text-[#F97316]",
  "user-management": "bg-[#F3E8FF] text-[#9333EA]",
  system: "bg-[#EFF6FF] text-[#3B82F6]",
  compliance: "bg-[#E6F7F7] text-[#0EADAB]",
  "data-changes": "bg-[#FCE7F3] text-[#DB2777]",
};
const SHORT_LABELS = { "user-management": "User Mgmt", billing: "Billing" };

const initials = (name = "") => name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
const day = (value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const time = (value) => new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// logs: one page from the server (already filtered); totalEvents: the count for the filters
export default function AuditTable({
  logs,
  loading = false,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalEvents = 0,
  onOpenExportModal,
}) {
  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 shadow-xs flex flex-col overflow-hidden">
      {/* ── 1. Tabs & Export ── */}
      <div className="px-5 pt-4 border-b border-light-gray/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto -mb-px">
          {auditTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  isActive ? "border-primary text-primary" : "border-transparent text-medium-black hover:text-dark-black hover:border-light-gray"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="pb-3 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black/85 hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── 2. Search ── */}
      <div className="p-4 sm:p-5 border-b border-light-gray/70 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1 sm:flex-initial sm:w-80">
          <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search action, user, entity ID, IP or details..."
            aria-label="Search audit logs"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-light-gray text-xs font-normal text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* ── 3. Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider bg-[#FAFCFC]">
              <th className="py-3 px-4 font-semibold">Time</th>
              <th className="py-3 px-4 font-semibold">User</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Entity</th>
              <th className="py-3 px-4 font-semibold">Entity ID</th>
              <th className="py-3 px-4 font-semibold">IP Address</th>
              <th className="py-3 px-4 font-semibold">Details</th>
              <th className="py-3 px-4 font-semibold">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-light-black">
                  {loading ? "Loading audit logs..." : "No audit log events match these filters."}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-light-gray/30 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-dark-black/90">{day(log.createdAt)}</span>
                      <span className="text-[11px] text-light-black font-normal">{time(log.createdAt)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {initials(log.user.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-dark-black/90 truncate max-w-[160px]" title={log.user.name}>{log.user.name}</span>
                        <span className="text-[10px] text-light-black">{log.user.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-dark-black/90">{log.action}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-medium-black">{log.entity}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-dark-black/85 font-mono text-[11px] max-w-[140px] truncate" title={log.entityId}>{log.entityId}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-medium-black font-mono text-[11px]">{log.ipAddress}</td>
                  <td className="py-3.5 px-4 min-w-[180px] max-w-[260px]">
                    <span className="text-medium-black text-xs block truncate" title={log.details}>{log.details}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_STYLES[log.categoryKey] ?? "bg-[#F1F5F9] text-[#64748B]"}`}>
                      {SHORT_LABELS[log.categoryKey] ?? log.category}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. Paging ── */}
      <div className="p-4 border-t border-light-gray/70">
        <Pagination
          currentPage={currentPage}
          totalItems={totalEvents}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(Number.parseInt(size, 10) || 10);
            setCurrentPage(1);
          }}
          pageSizeOptions={PAGE_SIZES}
          itemLabel="events"
        />
      </div>
    </div>
  );
}

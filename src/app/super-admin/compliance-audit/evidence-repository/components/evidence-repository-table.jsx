"use client";

import React, { useState } from "react";
import { Search, Plus, FileText, FileSpreadsheet, FileImage, File } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Pagination from "@/components/shared/pagination/pagination";
import { formatDate } from "@/lib/client-api";
import { EVIDENCE_STATUSES, TRUST_SERVICE_CRITERIA, controlsLabel } from "@/lib/compliance/evidence-catalog";

const TABS = ["All Evidence", "Expiring Soon", "Recently Added", "Archived"];
const STATUS_STYLES = {
  Verified: "bg-emerald-50 text-emerald-600",
  "Under Review": "bg-amber-50 text-amber-600",
  "Needs Changes": "bg-rose-50 text-rose-600",
  Draft: "bg-gray-100 text-gray-600",
  Expired: "bg-red-50 text-red-600",
  Archived: "bg-slate-100 text-slate-500",
};
const DAY = 86400000;

function FileIcon({ type }) {
  if (type === "xlsx" || type === "xls" || type === "csv") return <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><FileSpreadsheet className="w-4 h-4" /></div>;
  if (["png", "jpg", "jpeg"].includes(type)) return <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><FileImage className="w-4 h-4" /></div>;
  if (type === "pdf") return <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0"><FileText className="w-4 h-4" /></div>;
  return <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><File className="w-4 h-4" /></div>;
}

// data: /api/v1/compliance/evidence. Archived evidence only shows in the Archived tab.
export default function EvidenceRepositoryTable({ data, onOpenUploadModal, onSelectEvidence }) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [control, setControl] = useState("All Controls");
  const [criteria, setCriteria] = useState("All Trust Service Criteria");
  const [owner, setOwner] = useState("All Owners");
  const [status, setStatus] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // "Recently Added" = the last 30 days; computed once per visit
  const [recentSince] = useState(() => Date.now() - 30 * DAY);

  const items = data?.results ?? [];
  const term = searchTerm.trim().toLowerCase();
  const inTab = (item) => {
    if (activeTab === "Archived") return item.status === "Archived";
    if (item.status === "Archived") return false;
    if (activeTab === "Expiring Soon") return item.status === "Verified" && item.daysRemaining !== null && item.daysRemaining <= 30;
    if (activeTab === "Recently Added") return new Date(item.createdAt).getTime() >= recentSince;
    return true;
  };
  const filtered = items.filter((item) =>
    inTab(item) &&
    // Search by name, control, owner and ID (client item)
    (!term || `${item.reference} ${item.name} ${item.description} ${item.controls.join(" ")} ${item.owner?.name ?? ""}`.toLowerCase().includes(term)) &&
    (control === "All Controls" || item.controls.includes(control)) &&
    (criteria === "All Trust Service Criteria" || item.criteria.includes(criteria)) &&
    (owner === "All Owners" || item.owner?.name === owner) &&
    (status === "All Statuses" || item.status === status)
  );
  const tabCount = (tab) => items.filter((item) => (tab === "Archived" ? item.status === "Archived" : item.status !== "Archived" && (tab === "All Evidence" || (tab === "Expiring Soon" ? item.status === "Verified" && item.daysRemaining !== null && item.daysRemaining <= 30 : new Date(item.createdAt).getTime() >= recentSince)))).length;
  const page = Math.min(currentPage, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pick = (setter) => (value) => { setter(value); setCurrentPage(1); };

  const options = (all, list) => [{ value: all, label: all }, ...list.map((value) => ({ value, label: value }))];

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden">
      <div className="px-5 pt-4 border-b border-light-gray/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 overflow-x-auto -mb-px" role="tablist">
          {TABS.map((tab) => (
            <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`pb-3 px-1 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-medium-black hover:text-dark-black"}`}>
              {tab} ({tabCount(tab)})
            </button>
          ))}
        </div>
        {data?.permissions.manage && (
          <button type="button" onClick={onOpenUploadModal} className="mb-3 sm:mb-2 px-4 py-2 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
            <Plus className="w-4 h-4 stroke-[2.5]" /> Upload Evidence
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 border-b border-light-gray/70 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" value={searchTerm} onChange={(event) => pick(setSearchTerm)(event.target.value)} placeholder="Search by name, control, owner or ID..." aria-label="Search evidence" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <div className="w-36"><Dropdown items={options("All Controls", (data?.controls ?? []).map((item) => item.id))} selected={control} onSelect={pick(setControl)} variant="sm" className="w-full" /></div>
          <div className="w-56"><Dropdown items={options("All Trust Service Criteria", TRUST_SERVICE_CRITERIA)} selected={criteria} onSelect={pick(setCriteria)} variant="sm" className="w-full" /></div>
          <div className="w-36"><Dropdown items={options("All Owners", (data?.owners ?? []).map((item) => item.name))} selected={owner} onSelect={pick(setOwner)} variant="sm" className="w-full" /></div>
          <div className="w-36"><Dropdown items={options("All Statuses", EVIDENCE_STATUSES)} selected={status} onSelect={pick(setStatus)} variant="sm" className="w-full" /></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-light-gray bg-[#FAFCFC] text-[11px] font-semibold text-light-black tracking-wider">
              <th className="py-3 pl-5 pr-3">Evidence Name</th>
              <th className="py-3 px-3">Associated Controls</th>
              <th className="py-3 px-3 whitespace-nowrap">Trust Service Criteria</th>
              <th className="py-3 px-3">Owner</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Last Updated</th>
              <th className="py-3 pl-3 pr-5">Evidence Expiration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60">
            {rows.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-light-black">{data ? "No evidence matches these filters." : "Loading evidence..."}</td></tr>}
            {rows.map((item) => (
              <tr key={item.id} onClick={() => onSelectEvidence(item)} className="hover:bg-light-gray/30 cursor-pointer transition-colors">
                <td className="py-3.5 pl-5 pr-3">
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <FileIcon type={item.file?.type} />
                    <div className="min-w-0">
                      <p className="font-semibold text-dark-black truncate">{item.name}</p>
                      <p className="text-[11px] text-light-black truncate">{item.reference}{item.description ? ` · ${item.description}` : ""}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3 whitespace-nowrap font-medium text-dark-black/75" title={item.controls.join(", ")}>{controlsLabel(item.controls)}</td>
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4F2] text-[#0D9488]" title={item.criteria.join(", ")}>
                    {item.criteria.length > 1 ? `${item.criteria[0]} +${item.criteria.length - 1}` : item.criteria[0]}
                  </span>
                </td>
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <p className="font-semibold text-dark-black">{item.owner?.name ?? "—"}</p>
                  <p className="text-[10px] text-light-black">{item.owner?.role ?? ""}</p>
                </td>
                <td className="py-3.5 px-3 whitespace-nowrap"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[item.status] ?? STATUS_STYLES.Draft}`}>{item.status}</span></td>
                <td className="py-3.5 px-3 whitespace-nowrap text-medium-black">{formatDate(item.updatedAt)}</td>
                <td className="py-3.5 pl-3 pr-5 whitespace-nowrap">
                  {item.expiresOn ? (
                    <>
                      <p className="text-medium-black">{formatDate(`${item.expiresOn}T12:00:00`)}</p>
                      <p className={`text-[10px] ${item.daysRemaining < 0 ? "text-red-500" : item.daysRemaining <= 30 ? "text-amber-600" : "text-light-black"}`}>
                        {item.daysRemaining < 0 ? `${-item.daysRemaining} days ago` : `${item.daysRemaining} days left`}
                      </p>
                    </>
                  ) : (
                    <span className="text-light-black">Does Not Expire</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 sm:px-5 border-t border-light-gray/70">
        <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} itemLabel="evidence items" />
      </div>
    </div>
  );
}

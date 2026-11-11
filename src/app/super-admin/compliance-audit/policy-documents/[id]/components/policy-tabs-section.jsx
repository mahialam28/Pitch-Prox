"use client";

import React, { useState } from "react";
import { Upload, Eye, Download, RotateCcw, User } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/client-api";

const VERSION_STYLES = {
  approved: "bg-[#DCFCE7] text-[#16A34A]",
  under_review: "bg-[#FEF3C7] text-[#D97706]",
  draft: "bg-[#F3F4F6] text-medium-black",
  rejected: "bg-rose-50 text-rose-600",
  superseded: "bg-[#F1F5F9] text-[#64748B]",
};
const EMPLOYEE_STYLES = { Acknowledged: "text-[#16A34A]", Pending: "text-amber-600", Overdue: "text-rose-500" };

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "versions", label: "Version History" },
  { id: "employees", label: "Employees" },
];

export default function PolicyTabsSection({ policy, permissions, viewingVersionId, onViewVersion, onRestoreVersion, onUploadNewVersion }) {
  const [activeTab, setActiveTab] = useState("overview");
  const preparing = Boolean(policy.pendingVersion);
  const archived = policy.statusKey === "archived";

  return (
    <div className="bg-white rounded-3xl border border-light-gray shadow-xs overflow-hidden w-full">
      <div className="flex items-center border-b border-light-gray px-6 pt-4 gap-6" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${activeTab === tab.id ? "text-primary font-bold" : "text-light-black hover:text-dark-black/80"}`}
          >
            {tab.label}
            {tab.id === "employees" && policy.acknowledgment ? ` (${policy.acknowledgment.total})` : ""}
            {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="p-6 space-y-2.5">
          <h4 className="text-xs sm:text-sm font-bold text-dark-black/85 font-secondary">Description</h4>
          <p className="text-xs sm:text-sm text-medium-black leading-relaxed font-normal">{policy.description || "No description yet."}</p>
        </div>
      )}

      {activeTab === "versions" && (
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="space-y-0.5">
              <h4 className="text-base font-bold text-dark-black/85 font-secondary">Version History</h4>
              <p className="text-xs text-light-black">View, download, or restore previous versions. Restoring creates a new version for approval.</p>
            </div>
            {permissions.manage && !archived && !preparing && (
              <button
                type="button"
                onClick={onUploadNewVersion}
                className="px-4 py-2 rounded-xl border border-light-gray hover:border-primary/40 bg-white text-xs font-semibold text-dark-black/85 hover:text-primary transition-all cursor-pointer shadow-2xs flex items-center gap-2 self-start sm:self-auto shrink-0"
              >
                <Upload className="w-4 h-4 text-primary" />
                Upload New Version
              </button>
            )}
          </div>

          <div className="space-y-3">
            {policy.versions.map((version) => (
              <div key={version.id} className={`p-4 rounded-2xl border ${version.id === viewingVersionId ? "border-primary/50 bg-primary/5" : "border-light-gray"} space-y-2`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-dark-black/85 font-secondary">{version.versionLabel}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${VERSION_STYLES[version.status] ?? VERSION_STYLES.draft}`}>{version.statusLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button type="button" onClick={() => onViewVersion(version.id)} className="flex items-center gap-1 text-dark-black/70 hover:text-primary cursor-pointer">
                      <Eye className="w-3.5 h-3.5" /> <span>View</span>
                    </button>
                    {version.file && (
                      <a href={`/api/v1/compliance/policies/${policy.id}/file?version=${version.id}`} className="flex items-center gap-1 text-dark-black/70 hover:text-primary">
                        <Download className="w-3.5 h-3.5" /> <span>Download</span>
                      </a>
                    )}
                    {permissions.manage && !archived && !preparing && version.status === "superseded" && (
                      <button type="button" onClick={() => onRestoreVersion(version.id)} className="flex items-center gap-1 text-dark-black/70 hover:text-primary cursor-pointer">
                        <RotateCcw className="w-3.5 h-3.5" /> <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-medium-black">{version.changeNote || (version.restoredFrom ? `Restored from v${version.restoredFrom}` : "No change note.")}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-light-black flex-wrap">
                  <User className="w-3 h-3" />
                  <span>{version.createdBy}</span>
                  <span>·</span>
                  <span>{formatDate(version.createdAt)}</span>
                  {version.decidedAt && (version.status === "approved" || version.status === "superseded") && <span>· approved by {version.decidedBy ?? "—"} on {formatDate(version.decidedAt)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "employees" && (
        <div className="p-6">
          {!policy.acknowledgment ? (
            <p className="text-xs text-light-black">Employees sign once this policy is approved and requires acknowledgment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-light-black border-b border-light-gray">
                    <th className="py-2 pr-4 font-semibold">Employee</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    <th className="py-2 pl-4 font-semibold">Signed / due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/70">
                  {policy.employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="py-2.5 pr-4 font-semibold text-dark-black/85">{employee.name}</td>
                      <td className={`py-2.5 px-4 font-semibold ${EMPLOYEE_STYLES[employee.status]}`}>{employee.status}</td>
                      <td className="py-2.5 pl-4 text-light-black">{employee.acknowledgedAt ? formatDateTime(employee.acknowledgedAt) : `Due ${formatDate(employee.dueAt)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

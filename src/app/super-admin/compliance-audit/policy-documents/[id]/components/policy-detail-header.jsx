"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit3, Trash2, Archive, RotateCcw } from "lucide-react";

const STATUS_STYLES = {
  Approved: "bg-[#DCFCE7] text-[#16A34A]",
  "Under Review": "bg-[#FEF3C7] text-[#D97706]",
  Draft: "bg-[#F3F4F6] text-medium-black",
  Archived: "bg-[#F1F5F9] text-[#64748B]",
};

// Title row: status, version, download, edit, delete (never approved) / archive (approved)
export default function PolicyDetailHeader({ policy, permissions, onEditClick, onDeleteClick, onUnarchive }) {
  const archived = policy.statusKey === "archived";
  const neverApproved = policy.statusKey === "draft" || policy.statusKey === "under_review";
  const current = policy.versions.find((version) => version.status === "approved");
  const file = current?.file ?? (neverApproved ? policy.versions[0]?.file : null);
  const fileVersion = current ?? policy.versions[0];

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs text-light-black">
        <Link href="/super-admin/compliance-audit/policy-documents" className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Policy Documents
        </Link>
        <span>/</span>
        <span className="text-dark-black/80 font-medium truncate max-w-xs sm:max-w-md">{policy.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/85 font-secondary tracking-tight">{policy.name}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[policy.status] ?? STATUS_STYLES.Draft}`}>{policy.status}</span>
            <span className="text-xs font-semibold text-light-black">Version {policy.version}</span>
          </div>
          {policy.description && <p className="text-xs sm:text-sm text-light-black">{policy.description}</p>}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {file && (
            <a
              href={`/api/v1/compliance/policies/${policy.id}/file?version=${fileVersion.id}`}
              className="px-4 py-2 rounded-xl border border-light-gray bg-white hover:bg-light-gray/40 text-xs sm:text-sm font-semibold text-dark-black/85 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-dark-black/70" />
              Download {file.isPdf ? "PDF" : "Document"}
            </a>
          )}
          {permissions.manage && !archived && (
            <button type="button" onClick={onEditClick} className="px-4 py-2 rounded-xl bg-primary hover:bg-[#0c9593] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm">
              <Edit3 className="w-4 h-4" />
              Edit Document
            </button>
          )}
          {permissions.approve && archived && (
            <button type="button" onClick={onUnarchive} className="px-4 py-2 rounded-xl bg-primary hover:bg-[#0c9593] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm">
              <RotateCcw className="w-4 h-4" />
              Restore Policy
            </button>
          )}
          {permissions.approve && !archived && (
            <button type="button" onClick={onDeleteClick} className="px-3.5 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs sm:text-sm font-semibold text-rose-600 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs">
              {neverApproved ? <Trash2 className="w-4 h-4 text-rose-600" /> : <Archive className="w-4 h-4 text-rose-600" />}
              {neverApproved ? "Delete" : "Archive"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

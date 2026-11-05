"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  FileSpreadsheet,
  Eye,
  Download,
  Trash2,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import { controlsOf, criteriaOf } from "../evidence-options";

export default function EvidenceDetailsModal({
  isOpen,
  onClose,
  evidence,
  onEdit,
  onDelete,
  onUpdate,
}) {
  if (!isOpen || !evidence) return null;

  const status = evidence.status || "Verified";
  const stamp = () => new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  // Status changes; Verified By / Verified At are filled automatically, never typed in
  const changeStatus = (next, message, extra = {}) => {
    onUpdate?.({ ...evidence, status: next, ...extra });
    toast.success(message);
    onClose();
  };
  const versions = evidence.versions ?? [{ version: 1 }];

  const handleDownload = () => {
    toast.success(`Downloading ${evidence.name}.pdf...`);
  };

  const handleView = () => {
    toast.success(`Opening preview for ${evidence.name}`);
  };

  // Only drafts can be permanently deleted; submitted evidence is archived instead
  const handleDelete = () => {
    if (onDelete) {
      onDelete(evidence.id);
    }
    toast.success(`Deleted draft "${evidence.name}"`);
    onClose();
  };

  const isPdf = evidence.fileType === "pdf" || !evidence.fileType;
  const isXlsx = evidence.fileType === "xlsx";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-light-gray w-full max-w-xl max-h-[92vh] flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 sm:px-7 pt-6 pb-4 border-b border-light-gray/60">
            <div className="flex items-center gap-3.5">
              {/* Document Type Icon Badge */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isPdf
                    ? "bg-red-50/80 border-red-100 text-red-500"
                    : isXlsx
                    ? "bg-emerald-50/80 border-emerald-100 text-emerald-500"
                    : "bg-blue-50/80 border-blue-100 text-blue-500"
                }`}
              >
                {isXlsx ? (
                  <FileSpreadsheet className="w-6 h-6 stroke-[1.8]" />
                ) : (
                  <FileText className="w-6 h-6 stroke-[1.8]" />
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary">
                    {evidence.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      evidence.status === "Verified"
                        ? "bg-[#E6F7F7] text-[#00A3A3]"
                        : "bg-[#EFF6FF] text-[#2563EB]"
                    }`}
                  >
                    {evidence.status || "Verified"}
                  </span>
                </div>
                <p className="text-xs text-light-black">
                  {evidence.description || "User access review attestation"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-light-gray/60 flex items-center justify-center text-light-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto px-6 sm:px-7 py-5 space-y-5 text-xs">
            {/* ── Evidence details ── */}
            <div className="bg-[#F8FAFA] rounded-2xl border border-light-gray/70 p-4 sm:p-5 grid grid-cols-2 gap-y-4 gap-x-6">
              {[
                ["Evidence Name", evidence.name],
                ["Status", status],
                ["Evidence Owner", evidence.owner?.name ?? "—"],
                ["File Type / Size", `${(evidence.fileType || "PDF").toUpperCase()} • 2.4 MB`],
                ["Associated Controls", controlsOf(evidence).join(", ") || "—"],
                ["Trust Service Criteria", criteriaOf(evidence).join(", ") || "—"],
                ["Evidence Period", evidence.period ?? "Q1 2024"],
                ["Evidence Expiration", evidence.expiryDate?.date ?? "Does Not Expire"],
                ["Uploaded By", evidence.uploadedBy ?? evidence.owner?.name ?? "—"],
                ["Uploaded At", evidence.uploadedAt ?? `${evidence.lastUpdated?.date ?? ""} ${evidence.lastUpdated?.time ?? ""}`],
                ["Last Updated", `${evidence.lastUpdated?.date ?? "—"} • ${evidence.lastUpdated?.time ?? ""}`],
                ["Verified By", status === "Verified" ? evidence.verifiedBy ?? "Daniel Miller" : "—"],
                ["Verified At", status === "Verified" ? evidence.verifiedAt ?? "May 19, 2024 10:24 AM" : "—"],
                ["Current Version", `v${versions.length}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-[10px] font-bold text-light-black tracking-wider uppercase block mb-0.5">{label}</span>
                  <span className="text-xs sm:text-sm font-semibold text-dark-black/85">{value}</span>
                </div>
              ))}
            </div>

            {/* ── Description ── */}
            <div className="space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/85 font-secondary">
                Description / Supporting Notes
              </h4>
              <p className="text-xs text-dark-black/75 leading-relaxed font-normal">
                {evidence.description || "Quarterly attestation confirming that user access rights have been reviewed, validated, and approved in accordance with company policy and SOC 2 control requirements."}
              </p>
            </div>

            {/* ── Verification Note (written by the reviewer) ── */}
            <div className="space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/85 font-secondary">Verification Note</h4>
              <p className="text-xs text-dark-black/75 leading-relaxed font-normal">
                {evidence.verificationNote ?? (status === "Verified" ? "Reviewed and verified against approved user access review process and supporting documentation." : "Not reviewed yet.")}
              </p>
            </div>

            {/* ── Attached File ── */}
            <div className="space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/85 font-secondary">
                Attached File
              </h4>

              <div className="border border-light-gray rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-dark-black/85 truncate">
                      {evidence.name.replace(/\s+/g, "-")}.pdf
                    </p>
                    <p className="text-[11px] text-light-black">2.4 MB • PDF</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={handleView}
                    className="text-primary hover:text-[#0c9593] flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="text-primary hover:text-[#0c9593] flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Footer Actions (depend on the evidence status) ── */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-light-gray/70">
              {status === "Draft" && (
                <button type="button" onClick={handleDelete} className="mr-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 border border-red-200/90 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Draft</span>
                </button>
              )}
              {["Verified", "Expired", "Under Review", "Needs Changes"].includes(status) && (
                <button
                  type="button"
                  onClick={() => changeStatus("Archived", `Archived "${evidence.name}". It stays in the audit history.`)}
                  className="mr-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-medium-black border border-light-gray hover:bg-light-gray/60 transition-colors cursor-pointer"
                >
                  Archive Evidence
                </button>
              )}
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-dark-black/80 hover:bg-light-gray/60 border border-light-gray transition-colors cursor-pointer">
                Close
              </button>
              {["Draft", "Needs Changes"].includes(status) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit?.(evidence);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-primary border border-primary hover:bg-primary/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
              {status === "Draft" && (
                <button type="button" onClick={() => changeStatus("Under Review", "Sent for review.")} className="px-4 py-2 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer">
                  Submit for Review
                </button>
              )}
              {status === "Needs Changes" && (
                <button type="button" onClick={() => changeStatus("Under Review", "Resubmitted for review.")} className="px-4 py-2 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer">
                  Resubmit for Review
                </button>
              )}
              {status === "Under Review" && (
                <>
                  <button type="button" onClick={() => changeStatus("Needs Changes", "Returned to the owner for changes.", { verificationNote: "Please update and resubmit." })} className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 border border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer">
                    Request Changes
                  </button>
                  <button type="button" onClick={() => changeStatus("Verified", "Evidence verified.", { verifiedBy: "Daniel Miller", verifiedAt: stamp(), verificationNote: "Verified against the associated controls." })} className="px-4 py-2 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer">
                    Verify Evidence
                  </button>
                </>
              )}
              {["Verified", "Expired"].includes(status) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit?.(evidence);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Create New Version</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

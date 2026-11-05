"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  CheckCircle2,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

export default function PolicyDetailsModal({ policy, isOpen, onClose, onApprovePolicy }) {
  if (!isOpen || !policy) return null;

  const handleDownload = () => {
    toast.success(`Downloading ${policy.name}...`);
  };

  const handleApprove = () => {
    if (onApprovePolicy) {
      onApprovePolicy(policy.id);
    }
    toast.success(`Policy "${policy.name}" approved successfully!`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-light-gray flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  policy.iconType === "doc"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-dark-black/85 font-secondary">
                    {policy.name}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-light-gray text-dark-black/70">
                    {policy.version}
                  </span>
                  {policy.status === "Approved" ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                      Approved
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
                      {policy.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-light-black mt-1">
                  {policy.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray/70 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-light-gray/40 border border-light-gray">
              <div>
                <span className="text-light-black font-medium block">Category</span>
                <span className="font-semibold text-dark-black/85 mt-0.5 block">
                  {policy.category}
                </span>
              </div>
              <div>
                <span className="text-light-black font-medium block">Effective Date</span>
                <span className="font-semibold text-dark-black/85 mt-0.5 block">
                  {policy.effectiveDate}
                </span>
              </div>
              <div>
                <span className="text-light-black font-medium block">Last Updated</span>
                <span className="font-semibold text-dark-black/85 mt-0.5 block">
                  {policy.lastUpdated}
                </span>
              </div>
              <div>
                <span className="text-light-black font-medium block">Next Review</span>
                <span className="font-semibold text-dark-black/85 mt-0.5 block">
                  {policy.nextUpdated}
                </span>
              </div>
            </div>

            {/* Compliance & Acknowledgment Stats */}
            <div className="p-4 rounded-xl border border-light-gray space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-dark-black/85 font-secondary text-sm">
                  Employee Acknowledgment Progress
                </span>
                <span className="font-bold text-primary text-sm">
                  {policy.acknowledgment}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-light-gray rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: policy.acknowledgment }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-light-black pt-1">
                <span>187 of 202 active team members confirmed compliance</span>
                <span className="text-emerald-600 font-semibold">SOC2 & GDPR Audited</span>
              </div>
            </div>

            {/* Document Preview Placeholder */}
            <div className="p-6 rounded-xl border border-dashed border-light-gray bg-light-gray/20 flex flex-col items-center justify-center text-center space-y-2">
              <FileText className="w-8 h-8 text-light-black" />
              <div>
                <p className="font-semibold text-dark-black/80">
                  {policy.name}.pdf
                </p>
                <p className="text-[11px] text-light-black">
                  Version {policy.version} • 1.4 MB • Managed by {policy.owner || "Security Team"}
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="mt-2 px-4 py-2 rounded-xl bg-white border border-light-gray hover:border-primary/40 text-xs font-semibold text-dark-black/85 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                Download Document
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:px-6 border-t border-light-gray flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-dark-black/70 hover:bg-light-gray rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <div className="flex items-center gap-2">
              {policy.status !== "Approved" && (
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-[#0c9593] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Policy
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

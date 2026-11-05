"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  ChevronDown,
  FileCheck,
  Check,
} from "lucide-react";
import DatePicker from "@/components/modals/date-picker";
import toast from "react-hot-toast";

const categoryOptions = [
  "Security",
  "Access & Identity",
  "HR & People",
  "Compliance",
  "IT & Operations",
  "Legal",
  "Data Privacy",
];

export default function UploadDocumentModal({ isOpen, onClose, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    documentName: "Information Security Policy",
    category: "Security",
    version: "v1.0",
    effectiveDate: "2026-08-15",
    nextReviewDate: "2027-08-15",
    description: "",
    requireAcknowledgment: true,
    file: null,
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
        documentName: prev.documentName || file.name.replace(/\.[^/.]+$/, ""),
      }));
      toast.success(`Selected file: ${file.name}`);
    }
  };

  const handleSaveDraft = () => {
    if (!formData.documentName.trim()) {
      toast.error("Please enter a document name");
      return;
    }
    toast.success(`Saved "${formData.documentName}" as draft`);
    if (onUploadSuccess) {
      onUploadSuccess({
        id: String(Date.now()),
        name: formData.documentName,
        description: formData.description || "Draft policy document",
        category: formData.category,
        version: formData.version || "v0.1",
        status: "Draft",
        effectiveDate: formData.effectiveDate || "Pending",
        lastUpdated: "Today",
        nextUpdated: formData.nextReviewDate || "Pending",
        acknowledgment: "0%",
        owner: "Daniel Miller",
        iconType: "pdf",
      });
    }
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.documentName.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newDoc = {
        id: String(Date.now()),
        name: formData.documentName,
        description:
          formData.description || "Active compliance and security policy",
        category: formData.category,
        version: formData.version || "v1.0",
        status: "Approved",
        effectiveDate: formData.effectiveDate || "Today",
        lastUpdated: "Today",
        nextUpdated: formData.nextReviewDate || "Next Year",
        acknowledgment: formData.requireAcknowledgment ? "0%" : "N/A",
        owner: "Daniel Miller",
        iconType: "pdf",
      };

      if (onUploadSuccess) {
        onUploadSuccess(newDoc);
      }
      toast.success("Policy document uploaded successfully!");
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <h3 className="text-lg font-bold text-dark-black/85 font-secondary">
              Upload Document
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Document Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/80 block">
                Document Name <span className="text-red">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.documentName}
                onChange={(e) =>
                  setFormData({ ...formData, documentName: e.target.value })
                }
                placeholder="e.g. Information Security Policy"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>

            {/* Category & Version Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="font-semibold text-dark-black/80 block">
                  Category <span className="text-red">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 bg-white flex items-center justify-between hover:border-primary/50 transition-all font-medium"
                >
                  <span>{formData.category}</span>
                  <ChevronDown className="w-4 h-4 text-light-black" />
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-lg py-1 z-20 max-h-48 overflow-y-auto">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: cat });
                          setIsCategoryOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-light-gray/60 text-dark-black/80 font-medium transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Version */}
              <div className="space-y-1.5">
                <label className="font-semibold text-dark-black/80 block">
                  Version <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  placeholder="e.g. v1.0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Effective Date & Next Review Date Row with DatePicker at Top */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Effective Date */}
              <div className="space-y-1.5">
                <label className="font-semibold text-dark-black/80 block">
                  Effective Date <span className="text-red">*</span>
                </label>
                <DatePicker
                  value={formData.effectiveDate}
                  onChange={(val) => setFormData({ ...formData, effectiveDate: val })}
                  placeholder="Select effective date"
                  placement="top"
                />
              </div>

              {/* Next Review Date */}
              <div className="space-y-1.5">
                <label className="font-semibold text-dark-black/80 block">
                  Next Review Date <span className="text-red">*</span>
                </label>
                <DatePicker
                  value={formData.nextReviewDate}
                  onChange={(val) => setFormData({ ...formData, nextReviewDate: val })}
                  placeholder="Select review date"
                  placement="top"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/80 block">
                Description / Purpose
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief summary of policy requirements and scope..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
              />
            </div>

            {/* Drag & Drop Upload Area */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/80 block">
                Upload File (PDF or DOCX)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-light-gray hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-light-gray/20 hover:bg-primary/5 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                />
                {formData.file ? (
                  <div className="flex items-center justify-center gap-2 text-primary font-medium">
                    <FileCheck className="w-5 h-5" />
                    <span>{formData.file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-light-black group-hover:text-dark-black/80">
                    <div className="w-10 h-10 rounded-xl bg-white border border-light-gray flex items-center justify-center shadow-xs">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-dark-black/80">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </div>
                    <span className="text-[11px] text-light-black">
                      PDF, DOCX up to 25MB
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Teal Styled Checkbox */}
            <div
              onClick={() =>
                setFormData({
                  ...formData,
                  requireAcknowledgment: !formData.requireAcknowledgment,
                })
              }
              className="flex items-center gap-3 pt-1 cursor-pointer select-none group"
            >
              <div
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                  formData.requireAcknowledgment
                    ? "bg-primary border-primary text-white"
                    : "border-[#D1D5DB] bg-white group-hover:border-primary/60"
                }`}
              >
                {formData.requireAcknowledgment && (
                  <Check className="w-3 h-3 stroke-[3]" />
                )}
              </div>
              <span className="text-xs font-semibold text-dark-black/85">
                Require employee acknowledgment upon publishing
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-light-gray flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-dark-black/70 hover:bg-light-gray rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 text-xs font-semibold text-primary border border-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-[#0c9593] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isSubmitting ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

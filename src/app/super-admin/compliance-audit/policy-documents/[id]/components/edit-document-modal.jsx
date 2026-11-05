"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  ChevronDown,
  FileCheck,
  Check,
  Save,
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

export default function EditDocumentModal({
  isOpen,
  onClose,
  policy,
  onUpdateSuccess,
}) {
  const [formData, setFormData] = useState({
    documentName: "",
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

  useEffect(() => {
    if (policy) {
      setFormData({
        documentName: policy.name || "",
        category: policy.category || "Security",
        version: policy.version || "v1.0",
        effectiveDate: policy.effectiveDate || "2026-08-15",
        nextReviewDate: policy.nextUpdated || "2027-08-15",
        description: policy.description || "",
        requireAcknowledgment: true,
        file: null,
      });
    }
  }, [policy]);

  if (!isOpen || !policy) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
      toast.success(`Updated attachment file: ${file.name}`);
    }
  };

  const handleSaveDraft = () => {
    toast.success(`Policy "${formData.documentName}" saved as draft`);
    if (onUpdateSuccess) {
      onUpdateSuccess({
        ...policy,
        name: formData.documentName,
        category: formData.category,
        version: formData.version,
        effectiveDate: formData.effectiveDate,
        nextUpdated: formData.nextReviewDate,
        description: formData.description,
        status: "Draft",
      });
    }
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.documentName.trim()) {
      toast.error("Please enter document name");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Policy "${formData.documentName}" updated successfully!`);
      if (onUpdateSuccess) {
        onUpdateSuccess({
          ...policy,
          name: formData.documentName,
          category: formData.category,
          version: formData.version,
          effectiveDate: formData.effectiveDate,
          nextUpdated: formData.nextReviewDate,
          description: formData.description,
          lastUpdated: "Today",
        });
      }
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-[620px] bg-white rounded-3xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* ── Header ── */}
          <div className="p-6 sm:p-7 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-dark-black/90 font-secondary tracking-tight">
                Edit Policy Document
              </h2>
              <p className="text-xs sm:text-sm text-light-black">
                Update policy document details and configure review settings.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Scrollable Form Body ── */}
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-7 pt-2 space-y-4 overflow-y-auto flex-1"
          >
            {/* Dropzone Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#86efac]/70 hover:border-primary rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white hover:bg-[#F4FBFA]/40 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Icon Badge */}
              <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] text-primary flex items-center justify-center mb-3">
                <FileCheck className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Title & browse files */}
              <p className="text-sm font-bold text-dark-black/85">
                {formData.file
                  ? formData.file.name
                  : `${policy?.name || "Document"}.pdf`}
              </p>
              <p className="text-xs font-semibold text-light-black mt-0.5">
                or{" "}
                <span className="text-primary hover:underline font-semibold cursor-pointer">
                  browse to replace file
                </span>
              </p>

              <p className="text-[11px] text-light-black mt-2">
                PDF, DOC or DOCX • Maximum 25 MB
              </p>
            </div>

            {/* Row 1: Document Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-dark-black/85 mb-1.5 font-secondary">
                  Document Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.documentName}
                  onChange={(e) =>
                    setFormData({ ...formData, documentName: e.target.value })
                  }
                  placeholder="Information Security Policy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray/80 text-xs sm:text-sm text-dark-black/85 placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-dark-black/85 mb-1.5 font-secondary">
                  Category <span className="text-red">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray/80 bg-white text-xs sm:text-sm text-dark-black/85 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <span>{formData.category}</span>
                  <ChevronDown className="w-4 h-4 text-light-black" />
                </button>

                {/* Category Dropdown Menu */}
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: cat });
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm hover:bg-light-gray/60 transition-colors cursor-pointer ${
                          formData.category === cat
                            ? "text-primary font-bold bg-primary/5"
                            : "text-dark-black/85"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Version */}
            <div>
              <label className="block text-xs font-bold text-dark-black/85 mb-1.5 font-secondary">
                Version <span className="text-red">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                placeholder="v1.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray/80 text-xs sm:text-sm text-dark-black/85 placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Row 3: Effective Date & Next Review Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-dark-black/85 mb-1.5 font-secondary">
                  Effective Date <span className="text-red">*</span>
                </label>
                <DatePicker
                  value={formData.effectiveDate}
                  onChange={(val) =>
                    setFormData({ ...formData, effectiveDate: val })
                  }
                  placeholder="Select effective date"
                  placement="top"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-black/85 mb-1.5 font-secondary">
                  Next Review Date
                </label>
                <DatePicker
                  value={formData.nextReviewDate}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      nextReviewDate: val,
                    })
                  }
                  placeholder="Select next review date"
                  placement="top"
                  className="w-full"
                />
              </div>
            </div>

            {/* Row 4: Description */}
            <div>
              <label className="block text-xs font-bold text-dark-black/85 mb-1.5 font-secondary">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add a short description of this policy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray/80 text-xs sm:text-sm text-dark-black/85 placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Row 5: Require employee acknowledgment custom checkbox */}
            <div
              role="checkbox"
              aria-checked={formData.requireAcknowledgment}
              tabIndex={0}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  requireAcknowledgment: !prev.requireAcknowledgment,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setFormData((prev) => ({
                    ...prev,
                    requireAcknowledgment: !prev.requireAcknowledgment,
                  }));
                }
              }}
              className="flex items-start gap-3 pt-1 cursor-pointer select-none group"
            >
              {/* Custom Checkbox Box */}
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5 ${
                  formData.requireAcknowledgment
                    ? "bg-primary border border-primary text-white shadow-2xs"
                    : "border-2 border-light-black/50 bg-white group-hover:border-primary"
                }`}
              >
                {formData.requireAcknowledgment && (
                  <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                )}
              </div>

              {/* Label & Description */}
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary block group-hover:text-primary transition-colors">
                  Require employee acknowledgment
                </span>
                <span className="text-xs text-light-black block leading-relaxed">
                  Assigned employees will be notified and asked to confirm they have read this document.
                </span>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="pt-4 border-t border-light-gray/70 flex items-center justify-between gap-3">
              {/* Left: Save as Draft */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl border border-light-gray/80 bg-white hover:bg-light-gray/40 text-xs sm:text-sm font-semibold text-dark-black/85 transition-colors cursor-pointer shadow-2xs"
              >
                Save as Draft
              </button>

              {/* Right: Cancel and Save Changes */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-dark-black/70 hover:text-dark-black transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#0c9593] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

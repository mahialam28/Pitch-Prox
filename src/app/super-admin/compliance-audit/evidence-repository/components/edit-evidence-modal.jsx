"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  CloudUpload,
  FileCheck,
} from "lucide-react";
import EvidenceFields, { evidenceFieldsError } from "./evidence-fields";
import { SOC2_CONTROLS, controlsOf, criteriaOf } from "../evidence-options";
import toast from "react-hot-toast";


export default function EditEvidenceModal({
  isOpen,
  onClose,
  evidence,
  onSaveSuccess,
}) {
  // The page remounts this modal (key) for each evidence item, so state starts from it
  const [formData, setFormData] = useState(() => ({
    evidenceName: evidence?.name || "",
    description: evidence?.description || "",
    file: null,
  }));
  const [extra, setExtra] = useState(() => ({
    controls: evidence ? controlsOf(evidence).filter((id) => SOC2_CONTROLS.some((control) => control.id === id)) : [],
    criteria: evidence ? criteriaOf(evidence) : [],
    owner: evidence?.owner?.name || "Daniel Miller",
    expires: evidence?.expiryDate?.date && evidence.expiryDate.date !== "Does Not Expire" ? "on" : "never",
    expiryDate: evidence?.expiryDate?.date && evidence.expiryDate.date !== "Does Not Expire" ? evidence.expiryDate.date : "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !evidence) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
      toast.success(`Updated attached file: ${file.name}`);
    }
  };

  const handleSaveDraft = () => {
    if (!formData.evidenceName.trim()) {
      toast.error("Please enter an evidence name");
      return;
    }
    if (evidenceFieldsError(extra)) {
      toast.error(evidenceFieldsError(extra));
      return;
    }
    toast.success(`Saved changes for "${formData.evidenceName}" as draft`);
    if (onSaveSuccess) {
      onSaveSuccess({
        ...evidence,
        name: formData.evidenceName,
        description: formData.description,
        controls: extra.controls,
        controlId: extra.controls[0] ?? evidence.controlId,
        trustCriteriaList: extra.criteria,
        trustCriteria: extra.criteria[0] ?? "—",
        owner: { ...evidence.owner, name: extra.owner },
        expiryDate: extra.expires === "on" ? { date: extra.expiryDate, daysRemaining: "" } : { date: "Does Not Expire", daysRemaining: "" },
        // A new file is kept as a new version; the previous file is not overwritten
        ...(formData.file ? { versions: [...(evidence.versions ?? [{ version: 1, file: evidence.name }]), { version: (evidence.versions?.length ?? 1) + 1, file: formData.file.name }] } : {}),
        status: "Draft",
      });
    }
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.evidenceName.trim()) {
      toast.error("Please enter an evidence name");
      return;
    }

    if (evidenceFieldsError(extra)) {
      toast.error(evidenceFieldsError(extra));
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const updatedEvidence = {
        ...evidence,
        name: formData.evidenceName,
        description: formData.description,
        controls: extra.controls,
        controlId: extra.controls[0] ?? evidence.controlId,
        trustCriteriaList: extra.criteria,
        trustCriteria: extra.criteria[0] ?? "—",
        owner: { ...evidence.owner, name: extra.owner },
        expiryDate: extra.expires === "on" ? { date: extra.expiryDate, daysRemaining: "" } : { date: "Does Not Expire", daysRemaining: "" },
        // A new file is kept as a new version; the previous file is not overwritten
        ...(formData.file ? { versions: [...(evidence.versions ?? [{ version: 1, file: evidence.name }]), { version: (evidence.versions?.length ?? 1) + 1, file: formData.file.name }] } : {}),
        // Edited evidence goes back to a reviewer
        status: "Under Review",
        lastUpdated: {
          date: "Just now",
          time: "10:30 AM",
        },
      };

      if (onSaveSuccess) {
        onSaveSuccess(updatedEvidence);
      }
      toast.success("Evidence updated successfully!");
      onClose();
    }, 400);
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
          className="fixed inset-0 bg-black/45 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-light-gray w-full max-w-2xl max-h-[92vh] flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 sm:px-7 pt-6 pb-4 border-b border-light-gray/60">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-dark-black/90 font-secondary">
                Edit Evidence
              </h3>
              <p className="text-xs text-light-black">
                Update compliance evidence details and mapped controls.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-light-gray/60 flex items-center justify-center text-light-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto px-6 sm:px-7 py-5 space-y-5 text-xs">
            {/* Drag and Drop Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#CBD5E1] hover:border-primary/70 rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all bg-[#FAFCFC] hover:bg-primary/5 group flex flex-col items-center justify-center gap-2.5"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
              />

              {/* Teal circular upload cloud icon */}
              <div className="w-11 h-11 rounded-full bg-[#E6F7F7] flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <CloudUpload className="w-5 h-5" />
              </div>

              {formData.file ? (
                <div className="flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm">
                  <FileCheck className="w-4 h-4" />
                  <span>{formData.file.name}</span>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="font-bold text-dark-black/85 text-sm sm:text-base font-secondary">
                      Upload New Version (Optional)
                    </p>
                    <p className="text-[11px] text-light-black">
                      PDF, DOCX, XLSX, PNG or JPG • Max 25 MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-1 px-4 py-1.5 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black/80 hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer"
                  >
                    Browse Files
                  </button>
                </>
              )}
            </div>

            {/* Row 1: Evidence Name */}
            <div className="grid grid-cols-1 gap-4">
              {/* Evidence Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-dark-black/80 block">
                  Evidence Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.evidenceName}
                  onChange={(e) =>
                    setFormData({ ...formData, evidenceName: e.target.value })
                  }
                  placeholder="Enter evidence name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-xs"
                />
              </div>

            </div>

            <EvidenceFields value={extra} onChange={setExtra} />

            {/* Description / Supporting Notes */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/80 block">
                Description / Supporting Notes
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add any additional details about this evidence..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-xs"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-light-gray/70">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-dark-black/80 hover:bg-light-gray/60 border border-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-primary border border-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

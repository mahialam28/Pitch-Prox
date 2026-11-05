"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  Image as ImageIcon,
  FileCheck,
} from "lucide-react";
import DatePicker from "@/components/modals/date-picker";
import TimePicker from "@/components/modals/time-picker";
import toast from "react-hot-toast";
import { INCIDENT_CATEGORIES } from "../incident-data";

const categoryOptions = INCIDENT_CATEGORIES;

const severityOptions = ["Critical", "High", "Medium", "Low"];

export default function ReportIncidentModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    severity: "",
    date: "",
    time: "",
    reportedBy: "Daniel Miller",
    description: "",
    evidenceFile: null,
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSeverityOpen, setIsSeverityOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        evidenceFile: file,
      }));
      toast.success(`Attached evidence: ${file.name}`);
    }
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter an incident title to save draft");
      return;
    }

    const draftIncident = {
      id: `INC-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      subtitle: "(Draft)",
      category: formData.category || "Security Incident",
      categoryType:
        formData.category === "Unauthorized Access"
          ? "unauthorized"
          : formData.category === "Payment / Billing Abuse"
          ? "payment"
          : "security",
      severity: formData.severity || "Medium",
      status: "Open",
      reportedBy: {
        name: formData.reportedBy || "Daniel Miller",
        role: "Security Administrator",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
      },
      reportedAt: formData.date ? new Date(formData.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today",
      reportedTime: formData.time || "Just now",
      description: formData.description || "Draft incident logged for investigation.",
      evidenceFile: formData.evidenceFile?.name || null,
      resolutionNotes: "Draft state - awaiting triage.",
    };

    if (onSubmitSuccess) {
      onSubmitSuccess(draftIncident);
    }
    toast.success(`Saved incident "${formData.title}" as draft!`);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter an incident title");
      return;
    }

    if (!formData.category) {
      toast.error("Please select an incident category");
      return;
    }

    if (!formData.severity) {
      toast.error("Please select an incident severity level");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const now = new Date();
      const dateString = formData.date
        ? new Date(formData.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : now.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

      const timeString =
        formData.time ||
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

      const newIncident = {
        id: `INC-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        title: formData.title,
        subtitle: "(Manual Report)",
        category: formData.category,
        categoryType:
          formData.category === "Unauthorized Access"
            ? "unauthorized"
            : formData.category === "Payment / Billing Abuse"
            ? "payment"
            : "security",
        severity: formData.severity,
        status: "Open",
        reportedBy: {
          name: formData.reportedBy || "Daniel Miller",
          role: "Security Administrator",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
        },
        reportedAt: dateString,
        reportedTime: timeString,
        description: formData.description || "Reported incident logged for triage.",
        evidenceFile: formData.evidenceFile?.name || null,
        resolutionNotes: "Assigned to Security Operations center for initial review.",
      };

      if (onSubmitSuccess) {
        onSubmitSuccess(newIncident);
      }
      toast.success("Incident submitted successfully!");
      onClose();
    }, 450);
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
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-light-gray w-full max-w-xl max-h-[92vh] flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 sm:px-8 pt-7 pb-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-dark-black font-secondary tracking-tight">
                Report New Incident
              </h3>
              <p className="text-xs text-medium-black">
                Provide the details below to report a security, compliance, or operational incident.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-light-gray flex items-center justify-center text-light-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto px-6 sm:px-8 py-2 space-y-4 text-xs"
          >
            {/* Field: Incident Title */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/85 block">
                Incident Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter a short, clear title"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-xs shadow-2xs"
              />
            </div>

            {/* Field Grid: Category & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="font-semibold text-dark-black/85 block">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsSeverityOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black bg-white flex items-center justify-between hover:border-primary/50 transition-all font-medium text-xs cursor-pointer shadow-2xs"
                >
                  <span
                    className={`truncate ${
                      formData.category ? "text-dark-black" : "text-light-black"
                    }`}
                  >
                    {formData.category || "Select category"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-light-black shrink-0 ml-2" />
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto">
                    {categoryOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: opt });
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          formData.category === opt
                            ? "text-primary font-semibold bg-primary/5"
                            : "hover:bg-light-gray/50 text-dark-black/85"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Severity Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="font-semibold text-dark-black/85 block">
                  Severity
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsSeverityOpen(!isSeverityOpen);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black bg-white flex items-center justify-between hover:border-primary/50 transition-all font-medium text-xs cursor-pointer shadow-2xs"
                >
                  <span
                    className={`truncate ${
                      formData.severity ? "text-dark-black" : "text-light-black"
                    }`}
                  >
                    {formData.severity || "Select severity"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-light-black shrink-0 ml-2" />
                </button>

                {isSeverityOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
                    {severityOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, severity: opt });
                          setIsSeverityOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          formData.severity === opt
                            ? "text-primary font-semibold bg-primary/5"
                            : "hover:bg-light-gray/50 text-dark-black/85"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Field: Incident Occurred At using project's DatePicker & TimePicker */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/85 block">
                Incident Occurred At
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Picker */}
                <DatePicker
                  value={formData.date}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, date: val }))
                  }
                  placeholder="Select date"
                  placement="bottom"
                />

                {/* Time Picker */}
                <TimePicker
                  value={formData.time}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, time: val }))
                  }
                  placeholder="Select time"
                  placement="bottom"
                />
              </div>
            </div>

            {/* Field: Reported By */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/85 block">
                Reported By
              </label>
              {/* Filled with the signed-in user; not editable */}
              <input
                type="text"
                value={formData.reportedBy}
                readOnly
                aria-readonly="true"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-medium-black bg-light-gray/40 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-xs shadow-2xs"
              />
            </div>

            {/* Field: Incident Description */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/85 block">
                Incident Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what happened, who was affected, and any immediate actions taken..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-xs shadow-2xs"
              />
            </div>

            {/* Field: Attach Evidence */}
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-black/85 block">
                Attach Evidence
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#CBD5E1] hover:border-primary/70 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white hover:bg-primary/5 group flex flex-col items-center justify-center gap-1.5"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".png,.jpg,.jpeg,.pdf,.docx,.txt,.csv,.json"
                  className="hidden"
                />

                <div className="w-9 h-9 rounded-full bg-light-gray/60 flex items-center justify-center text-light-black group-hover:text-primary group-hover:scale-105 transition-all">
                  <ImageIcon className="w-5 h-5 stroke-[1.8]" />
                </div>

                {formData.evidenceFile ? (
                  <div className="flex items-center gap-1.5 text-primary font-semibold text-xs mt-1">
                    <FileCheck className="w-4 h-4" />
                    <span>{formData.evidenceFile.name}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-normal text-dark-black">
                      <span className="text-primary font-medium hover:underline">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-[11px] text-light-black">
                      Upload screenshots, documents, or logs (PNG, JPG, PDF, DOCX — max 10 MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-3 pt-5 pb-3 border-t border-light-gray/80">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-dark-black/80 bg-white hover:bg-light-gray/50 border border-light-gray transition-colors cursor-pointer shadow-2xs"
              >
                Save as Draft
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-dark-black/80 hover:bg-light-gray/50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Submitting..." : "Submit Incident"}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

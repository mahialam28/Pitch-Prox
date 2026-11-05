"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Plus,
  GripVertical,
  Trash2,
  FileText,
  FileCode,
  Video,
  UploadCloud,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import Dropdown from "@/components/shared/dropdown/dropdown";

const initialMaterials = [
  {
    id: "mat-1",
    title: "Privacy Policy Overview",
    type: "PDF",
    iconType: "pdf",
  },
  {
    id: "mat-2",
    title: "Data Handling Guidelines",
    type: "Document",
    iconType: "doc",
  },
  {
    id: "mat-3",
    title: "Employee Data Protection",
    type: "Video",
    iconType: "video",
  },
];

const categoryOptions = [
  { value: "Privacy", label: "Privacy" },
  { value: "Security", label: "Security" },
  { value: "AI Ethics", label: "AI Ethics" },
  { value: "Compliance", label: "Compliance" },
];

export default function CreateTrainingModal({ isOpen, onClose, onSubmit }) {
  const [trainingTitle, setTrainingTitle] = useState("");
  const [category, setCategory] = useState("Privacy");
  const [description, setDescription] = useState(
    "Help employees understand how to handle and protect personal and sensitive data in accordance with company policies and global privacy regulations."
  );
  const [searchMaterial, setSearchMaterial] = useState("");
  const [materials, setMaterials] = useState(initialMaterials);
  const [estimatedDuration, setEstimatedDuration] = useState("40 minutes");
  const [provideCertificate, setProvideCertificate] = useState(true);

  if (!isOpen) return null;

  // Delete material
  const handleDeleteMaterial = (id) => {
    setMaterials(materials.filter((item) => item.id !== id));
  };

  // Add material sample
  const handleAddMaterial = () => {
    const newId = `mat-${Date.now()}`;
    setMaterials([
      ...materials,
      {
        id: newId,
        title: searchMaterial || "New Compliance Handbook",
        type: "PDF",
        iconType: "pdf",
      },
    ]);
    setSearchMaterial("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      title: trainingTitle || "Data Privacy & Protection",
      category,
      description,
      materials,
      duration: estimatedDuration,
      certificate: provideCertificate,
    });
    onClose();
  };

  const renderMaterialIcon = (iconType) => {
    switch (iconType) {
      case "pdf":
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      case "doc":
        return (
          <div className="w-9 h-9 rounded-xl bg-[#EFF8FF] text-[#175CD3] flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
        );
      case "video":
        return (
          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
            <Video className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-dark-black/45 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl bg-white rounded-3xl border border-light-gray shadow-2xl overflow-hidden my-auto"
        >
          {/* Modal Header */}
          <div className="p-6 sm:p-7 pb-5 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-bold text-dark-black font-secondary tracking-tight">
                Create New Training
              </h2>
              <p className="text-xs sm:text-sm text-medium-black">
                Build a training course using materials from your Training Library.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-light-black hover:text-dark-black p-1.5 rounded-xl hover:bg-light-gray transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="px-6 sm:px-7 pb-6 space-y-5">
              {/* Row 1: Training Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Training Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-dark-black flex items-center gap-1 font-secondary">
                    Training Title <span className="text-red font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={trainingTitle}
                    onChange={(e) => setTrainingTitle(e.target.value)}
                    placeholder="e.g. Data Privacy & Protection"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-dark-black flex items-center gap-1 font-secondary">
                    Category <span className="text-red font-bold">*</span>
                  </label>
                  <Dropdown
                    items={categoryOptions}
                    selected={category}
                    onSelect={(val) => setCategory(val)}
                    variant="compact"
                    className="w-full"
                    buttonClassName="py-2.5 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Row 2: Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-dark-black flex items-center gap-1 font-secondary">
                  Description <span className="text-red font-bold">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Row 3: Select Materials from Library (Hold and Drag) */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-dark-black flex items-center gap-1 font-secondary">
                  Select Materials from Library <span className="text-red font-bold">*</span>
                </label>

                {/* Search & Add Button Bar */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchMaterial}
                      onChange={(e) => setSearchMaterial(e.target.value)}
                      placeholder="Search or select materials from library..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-4 py-2.5 rounded-xl border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Material</span>
                  </button>
                </div>

                {/* Reorderable Materials List */}
                <Reorder.Group
                  axis="y"
                  values={materials}
                  onReorder={setMaterials}
                  className="flex flex-col gap-2.5 mt-1"
                >
                  {materials.map((mat) => (
                    <Reorder.Item
                      key={mat.id}
                      value={mat}
                      whileDrag={{
                        scale: 1.02,
                        boxShadow:
                          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                        zIndex: 20,
                      }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-light-gray bg-white shadow-2xs hover:border-light-black/40 transition-colors cursor-grab active:cursor-grabbing select-none"
                    >
                      {/* Left: Icon + Title + Type */}
                      <div className="flex items-center gap-3 min-w-0">
                        {renderMaterialIcon(mat.iconType)}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-[13px] font-bold text-dark-black/90 truncate">
                            {mat.title}
                          </span>
                          <span className="text-[11px] text-light-black font-medium mt-0.5">
                            {mat.type}
                          </span>
                        </div>
                      </div>

                      {/* Right: Drag Sign + Divider + Trash */}
                      <div className="flex items-center gap-1 sm:gap-2 text-light-black shrink-0">
                        <div
                          className="p-1 hover:text-dark-black text-light-black/80 cursor-grab active:cursor-grabbing transition-colors"
                          title="Hold and drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <span className="text-light-gray select-none px-0.5">|</span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMaterial(mat.id);
                          }}
                          className="p-1 hover:text-[#EF4444] transition-colors cursor-pointer"
                          title="Remove material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              {/* Row 4: Estimated Duration & Certificate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
                {/* Estimated Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-dark-black font-secondary">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g. 40 minutes"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Certificate */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-dark-black font-secondary">
                    Certificate
                  </label>
                  <div className="flex items-center gap-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => setProvideCertificate(!provideCertificate)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        provideCertificate ? "bg-primary" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          provideCertificate ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-medium text-dark-black/85">
                      Issue certificate on completion
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-7 sm:py-5 border-t border-light-gray bg-white flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs sm:text-sm font-bold text-dark-black/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#0ca09e] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                <span>Create Training</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

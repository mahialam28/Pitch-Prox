"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateSegmentModal({
  isOpen,
  onClose,
  selectedLeads = [],
  onCreateSuccess,
}) {
  const [segmentName, setSegmentName] = useState("");
  const [description, setDescription] = useState("");
  const [customIconUrl, setCustomIconUrl] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleIconUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomIconUrl(url);
      toast.success("Segment icon uploaded!");
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!segmentName.trim()) {
      toast.error("Please enter a segment name");
      return;
    }

    const newSegment = {
      id: `seg-${Date.now()}`,
      name: segmentName,
      leadsCount: selectedLeads.length || 0,
      usedInCampaign: false,
      updatedAt: "Just now",
      iconType: "flame",
      color: "orange",
    };

    if (onCreateSuccess) onCreateSuccess(newSegment);
    toast.success(`Segment "${segmentName}" created successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl border border-light-gray shadow-xl w-full max-w-lg p-6 sm:p-7 flex flex-col gap-5 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-1">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg sm:text-xl font-bold text-dark-black tracking-tight">
              Create New Segment
            </h3>
            <p className="text-xs text-light-black">
              Create a group to organize and target selected leads.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-light-gray hover:bg-light-gray/60 text-light-black hover:text-dark-black flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          {/* 1. Segment Icon (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark-black/85">
              Segment Icon <span className="text-light-black font-normal">(optional)</span>
            </label>

            <div className="flex items-center gap-4">
              {/* Dropzone / Preview Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl border-2 border-dashed border-light-gray/80 hover:border-primary/50 bg-[#F8FAFC] flex items-center justify-center cursor-pointer transition-colors shrink-0 overflow-hidden shadow-2xs"
              >
                {customIconUrl ? (
                  <img
                    src={customIconUrl}
                    alt="Segment Icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UploadCloud className="w-6 h-6 text-slate-400 stroke-[1.8]" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs font-semibold transition-colors cursor-pointer w-fit shadow-2xs"
                >
                  Upload Icon
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconUpload}
                />
                <span className="text-[11px] text-light-black">
                  PNG, JPG or SVG • Max 2 MB
                </span>
              </div>
            </div>
          </div>

          {/* 2. Segment Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark-black/85">
              Segment Name <span className="text-red font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter segment name"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
          </div>

          {/* 3. Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark-black/85">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add a short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black/90 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs resize-none"
            />
          </div>

          {/* 4. Selected Leads Box */}
          {selectedLeads.length > 0 && (
            <div className="bg-[#EEFDFC]/70 border border-[#C6F5F2] rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-primary">
                {selectedLeads.length} leads selected
              </span>

              {/* Chips row */}
              <div className="flex items-center flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin">
                {selectedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-xl border border-light-gray/80 px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-dark-black/85 shadow-2xs"
                  >
                    <span
                      className={`w-5 h-5 rounded-full ${lead.avatarBg || "bg-emerald-50 text-emerald-600"} text-[10px] font-bold flex items-center justify-center`}
                    >
                      {lead.avatar}
                    </span>
                    <span className="text-[11px] font-semibold">{lead.name}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-primary hover:underline self-end transition-colors cursor-pointer"
              >
                Add more leads
              </button>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-light-gray/60 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs sm:text-sm font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Create Segment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

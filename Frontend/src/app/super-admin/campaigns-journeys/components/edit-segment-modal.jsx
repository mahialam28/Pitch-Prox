"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Flame, AlertCircle, Clock, UserX } from "lucide-react";
import toast from "react-hot-toast";

export default function EditSegmentModal({
  isOpen,
  onClose,
  segment,
  onUpdateSuccess,
}) {
  const [segmentName, setSegmentName] = useState("");
  const [description, setDescription] = useState("");
  const [customIconUrl, setCustomIconUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (segment && isOpen) {
      setSegmentName(segment.name || "");
      setDescription(segment.description || "");
      setCustomIconUrl(segment.iconUrl || null);
    }
  }, [segment, isOpen]);

  if (!isOpen) return null;

  const handleIconUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomIconUrl(url);
      toast.success("Segment icon updated!");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!segmentName.trim()) {
      toast.error("Please enter a segment name");
      return;
    }

    const updatedSegment = {
      ...segment,
      name: segmentName.trim(),
      description: description.trim(),
      iconUrl: customIconUrl,
      updatedAt: "Just now",
    };

    if (onUpdateSuccess) {
      onUpdateSuccess(updatedSegment);
    }
    toast.success(`Segment "${segmentName}" updated successfully!`);
    onClose();
  };

  const renderDefaultIcon = () => {
    if (customIconUrl) {
      return (
        <img
          src={customIconUrl}
          alt="Segment Icon"
          className="w-full h-full object-cover"
        />
      );
    }
    if (segment?.iconType === "alert") {
      return <AlertCircle className="w-6 h-6 text-sky-600 stroke-[1.8]" />;
    }
    if (segment?.iconType === "clock") {
      return <Clock className="w-6 h-6 text-purple-600 stroke-[1.8]" />;
    }
    if (segment?.iconType === "user") {
      return <UserX className="w-6 h-6 text-slate-600 stroke-[1.8]" />;
    }
    return <UploadCloud className="w-6 h-6 text-slate-400 stroke-[1.8]" />;
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
              Edit Segment
            </h3>
            <p className="text-xs text-light-black">
              Update group details to organize and target selected leads.
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                {renderDefaultIcon()}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

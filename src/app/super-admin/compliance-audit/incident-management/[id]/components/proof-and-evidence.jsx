"use client";

import React, { useRef } from "react";
import {
  CloudUpload,
  Image as ImageIcon,
  FileText,
  FileCode,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProofAndEvidence({
  proofFiles = [],
  evidenceNote = "",
  onAddFile,
  onRemoveFile,
  onNoteChange,
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const isImg = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

      const newFileObj = {
        id: `f-${Date.now()}`,
        name: file.name,
        size: `${sizeMb} MB`,
        type: isImg ? "image" : isPdf ? "pdf" : "log",
      };

      onAddFile(newFileObj);
      toast.success(`Attached evidence: ${file.name}`);
    }
  };

  const getFileIcon = (type) => {
    if (type === "image") {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4 stroke-[2]" />
        </div>
      );
    }
    if (type === "pdf") {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
        <FileCode className="w-4 h-4 stroke-[2]" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 p-5 sm:p-6 shadow-xs flex flex-col gap-5 w-full">
      {/* Title */}
      <h3 className="text-base font-bold text-dark-black/90 font-secondary">
        Proof &amp; Evidence
      </h3>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-primary/60 hover:border-primary rounded-2xl p-5 text-center cursor-pointer transition-all bg-[#FAFCFC] hover:bg-primary/5 group flex flex-col items-center justify-center gap-1.5"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".png,.jpg,.jpeg,.pdf,.docx,.log,.txt,.csv,.json"
          className="hidden"
        />

        {/* Teal Cloud Icon */}
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
          <CloudUpload className="w-4.5 h-4.5" />
        </div>

        <p className="text-xs font-normal text-medium-black mt-0.5">
          <span className="text-primary font-semibold hover:underline">
            Upload proof
          </span>{" "}
          or drag files here
        </p>
        <p className="text-[11px] text-light-black">
          PNG, JPG, PDF, DOCX or log files • Max 20 MB
        </p>
      </div>

      {/* Uploaded Files List */}
      {proofFiles.length > 0 && (
        <div className="space-y-2.5">
          {proofFiles.map((file) => (
            <div
              key={file.id || file.name}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-light-gray/80 bg-white hover:bg-light-gray/20 transition-colors shadow-2xs"
            >
              {/* Left File Icon & Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(file.type)}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-dark-black/85 truncate">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-light-black">
                    {file.size}
                  </span>
                </div>
              </div>

              {/* Right Actions: View & Delete */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toast.success(`Viewing ${file.name}`)}
                  className="px-2.5 py-1 text-xs font-semibold text-primary hover:text-[#0c9593] hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveFile(file.id || file.name);
                    toast.success(`Removed ${file.name}`);
                  }}
                  className="p-1 text-light-black hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Field: Evidence note (optional) */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-dark-black/75 block">
          Evidence note (optional)
        </label>
        <textarea
          rows={3}
          value={evidenceNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add any notes about the attached evidence..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal resize-none shadow-2xs leading-relaxed"
        />
      </div>
    </div>
  );
}

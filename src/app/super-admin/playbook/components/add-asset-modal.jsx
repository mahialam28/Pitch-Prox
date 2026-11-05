"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, File, FileText, Video, Presentation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddAssetModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [fileSize, setFileSize] = useState("2.5 MB");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        id: Date.now(),
        title: title.trim(),
        type: fileType,
        size: fileSize,
      });
      setTitle("");
    }
  };

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTitle(file.name);
      const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
      setFileType(ext);
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${mb} MB`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-light-gray">
            <h3 className="text-sm font-bold text-dark-black font-secondary">
              Upload Playbook Asset
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* File dropzone */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFilePicked}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-light-gray hover:border-primary rounded-xl p-5 text-center bg-light-gray/30 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <UploadCloud className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-105 transition-transform" />
              <p className="text-xs font-bold text-dark-black">
                Click to browse file
              </p>
              <p className="text-[10px] text-light-black mt-0.5">
                PDF, PPTX, MP4, DOCX up to 50MB
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-black mb-1.5">
                Asset Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Closing Scripts Walkthrough (PDF)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-dark-black mb-1.5">
                  Format
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-light-gray text-xs font-medium text-dark-black bg-white focus:outline-none focus:border-primary"
                >
                  <option value="PDF">PDF</option>
                  <option value="PPTX">PPTX</option>
                  <option value="MP4">MP4</option>
                  <option value="DOCX">DOCX</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-black mb-1.5">
                  File Size
                </label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="e.g. 2.4 MB"
                  className="w-full px-3 py-2 rounded-xl border border-light-gray text-xs font-medium text-dark-black bg-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Attach Asset
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddAssetModal;

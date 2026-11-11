"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Calendar, User, Tag, Copy, Check } from "lucide-react";

const ViewResourceModal = ({
  isOpen = false,
  onClose = () => {},
  resource = null,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !resource) return null;

  const handleCopy = () => {
    const textToCopy = resource.content || resource.description || resource.name;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-dark-black/90 truncate font-secondary">
                    {resource.name}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-light-gray text-medium-black shrink-0">
                    {resource.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-light-black mt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {resource.addedBy || "—"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {resource.addedDate || "—"}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Description */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-light-black block mb-1">
                Overview & Purpose
              </label>
              <p className="text-xs sm:text-sm text-medium-black leading-relaxed bg-light-gray/30 p-3.5 rounded-xl border border-light-gray">
                {resource.description || "No description provided for this resource."}
              </p>
            </div>

            {/* Script / Body Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-light-black">
                  Script Details & Talking Points
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-primary hover:text-medium-teal font-medium cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-light-gray/40 border border-light-gray text-xs sm:text-sm text-dark-black/90 font-normal leading-relaxed whitespace-pre-line space-y-2">
                {resource.content || <span className="text-light-black">No script text for this resource.</span>}
              </div>
            </div>
          </div>

          {resource.file && (
            <div className="px-5 sm:px-6 pb-2 -mt-2">
              <a href={resource.file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 hover:border-primary hover:text-primary">
                <FileText className="w-3.5 h-3.5" /> {resource.file.name} <span className="text-light-black">{resource.file.size}</span>
              </a>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end p-4 px-6 border-t border-light-gray bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViewResourceModal;

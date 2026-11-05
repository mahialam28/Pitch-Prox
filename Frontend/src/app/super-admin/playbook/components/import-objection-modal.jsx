"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DownloadCloud, Check, BookOpen } from "lucide-react";

const TEMPLATE_LIBRARIES = [
  {
    id: "re-top-25",
    title: "Top 25 Real Estate Objections",
    description: "Battle-tested scripts for pricing, timing, commissions, and competitive listings.",
    count: "25 objections",
    category: "Real Estate",
  },
  {
    id: "fsbo-probate",
    title: "FSBO & Expired Specialization",
    description: "Direct response objection framework for distressed and off-market owners.",
    count: "18 objections",
    category: "Targeted Leads",
  },
  {
    id: "investor-acquisitions",
    title: "Shark Tank / High Net Worth Strategy",
    description: "Authority-driven framework designed by Robert Herjavec for negotiations.",
    count: "28 objections",
    category: "Executive",
  },
];

const ImportObjectionModal = ({
  isOpen = false,
  onClose = () => {},
  onImport = () => {},
}) => {
  const [selectedId, setSelectedId] = useState("investor-acquisitions");

  if (!isOpen) return null;

  const handleApply = () => {
    onImport(selectedId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <DownloadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
                  Import Objection Library
                </h3>
                <p className="text-[11px] text-light-black font-normal mt-0.5">
                  Choose a pre-built industry template to populate your objection framework.
                </p>
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

          {/* List */}
          <div className="p-5 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {TEMPLATE_LIBRARIES.map((lib) => {
              const isSelected = selectedId === lib.id;
              return (
                <div
                  key={lib.id}
                  onClick={() => setSelectedId(lib.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs"
                      : "border-light-gray hover:border-light-black/30 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-light-gray/60 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 truncate font-secondary">
                          {lib.title}
                        </h4>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-light-gray text-medium-black shrink-0">
                          {lib.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-light-black font-normal mt-0.5 leading-relaxed">
                        {lib.description}
                      </p>
                      <span className="text-[10px] font-semibold text-primary mt-1 block">
                        {lib.count}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-1 transition-colors ${
                      isSelected ? "bg-primary text-white" : "border border-light-black/30"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 p-4 px-6 border-t border-light-gray bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Import Selected Library
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImportObjectionModal;

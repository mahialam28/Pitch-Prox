"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, BookOpen, FileText } from "lucide-react";

const TEMPLATE_RESOURCE_PACKS = [
  {
    id: "herjavec-master-pack",
    title: "Herjavec Sales Resource Pack",
    description: "Full suite of opening scripts, discovery banks, value guides, and closing scripts.",
    count: "24 resources",
    category: "Full Pack",
  },
  {
    id: "outbound-opener-kit",
    title: "High-Conversion Call Openers & Hooks",
    description: "15 pattern-interrupt openers tailored for cold calling, expireds, and FSBO leads.",
    count: "15 scripts",
    category: "Call Openers",
  },
  {
    id: "followup-email-pack",
    title: "Multi-Touch Email & SMS Cadence",
    description: "Pre-written nurture templates for 7-day, 14-day, and 30-day post-call follow-ups.",
    count: "12 templates",
    category: "Email Templates",
  },
  {
    id: "discovery-question-bank",
    title: "Advanced Discovery Question Repository",
    description: "Structured diagnostic questions to uncover pain points and urgency.",
    count: "30 questions",
    category: "Guides",
  },
];

const ImportResourceModal = ({
  isOpen = false,
  onClose = () => {},
  onImport = () => {},
}) => {
  const [selectedId, setSelectedId] = useState("herjavec-master-pack");

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
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
                  Import from Library
                </h3>
                <p className="text-[11px] text-light-black font-normal mt-0.5">
                  Select a pre-built content package to import into your playbook.
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
            {TEMPLATE_RESOURCE_PACKS.map((pack) => {
              const isSelected = selectedId === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedId(pack.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs"
                      : "border-light-gray hover:border-light-black/30 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-light-gray/60 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 truncate font-secondary">
                          {pack.title}
                        </h4>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-light-gray text-medium-black shrink-0">
                          {pack.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-light-black font-normal mt-0.5 leading-relaxed">
                        {pack.description}
                      </p>
                      <span className="text-[10px] font-semibold text-primary mt-1 block">
                        {pack.count}
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
              Import Selected Pack
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImportResourceModal;

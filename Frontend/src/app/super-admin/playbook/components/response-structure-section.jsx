"use client";

import React, { useState } from "react";
import {
  UserCheck,
  MessageSquare,
  FileText,
  ChevronsRight,
  ArrowRight,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export const DEFAULT_STRUCTURE_STEPS = [
  {
    id: "acknowledge",
    title: "Acknowledge",
    description: "Build rapport and validate the lead.",
    icon: UserCheck,
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    id: "address",
    title: "Address",
    description: "Answer or address the objection/need.",
    icon: MessageSquare,
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    id: "pivot",
    title: "Pivot",
    description: "Shift to value, questions, or benefit.",
    icon: FileText,
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    id: "next-step",
    title: "Next Step",
    description: "Guide to the next action or question.",
    icon: ChevronsRight,
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
];

export default function ResponseStructureSection({
  steps = DEFAULT_STRUCTURE_STEPS,
  onChange = () => {},
}) {
  const [items, setItems] = useState(steps);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSteps, setEditingSteps] = useState(steps);

  const handleSaveModal = () => {
    setItems(editingSteps);
    onChange(editingSteps);
    setIsEditModalOpen(false);
    toast.success("Response structure updated!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            3
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-dark-black font-secondary flex items-center gap-1.5">
              Response Structure
              <span className="text-light-black font-normal text-xs sm:text-sm">
                (How each prompt is formatted)
              </span>
            </h3>
            <p className="text-xs text-medium-black mt-0.5 font-normal">
              Choose the structure for every prompt PitchProX delivers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSteps(items);
            setIsEditModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      {/* ── 4 Sequential Cards with Arrow Connectors ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center pt-1">
        {items.map((step, idx) => {
          const IconComponent = step.icon || UserCheck;
          return (
            <React.Fragment key={step.id}>
              <div className="p-3.5 rounded-2xl border border-light-gray/90 bg-white shadow-2xs flex flex-col justify-between gap-2 min-h-[95px] relative group hover:border-primary/40 hover:shadow-xs transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-teal-50 text-primary border border-teal-100 flex items-center justify-center shrink-0">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-dark-black font-secondary leading-snug">
                    {step.title}
                  </h4>
                </div>
                <p className="text-[11px] text-light-black leading-relaxed">
                  {step.description}
                </p>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-light-gray overflow-hidden relative my-auto p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-light-gray">
                <div>
                  <h3 className="text-base font-bold text-dark-black font-secondary">
                    Customize Response Sequence
                    <span
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-light-gray text-[10px] font-bold text-medium-black cursor-help align-middle"
                      title="Control how the AI builds responses to objections. Adjust how much it acknowledges the prospect's concern, introduces a new perspective, communicates value, and guides the conversation toward the next step. For example, you can prioritize empathy before presenting a solution or move more directly toward an appointment when appropriate."
                      aria-label="About the response sequence"
                    >
                      i
                    </span>
                  </h3>
                  <p className="text-xs text-medium-black mt-0.5">
                    Adjust the 4 prompt construction pillars.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {editingSteps.map((s, i) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-light-gray space-y-2 bg-light-gray/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={s.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingSteps((prev) =>
                            prev.map((item) =>
                              item.id === s.id ? { ...item, title: val } : item
                            )
                          );
                        }}
                        className="w-full px-2.5 py-1 text-xs font-bold bg-white border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <input
                      type="text"
                      value={s.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingSteps((prev) =>
                          prev.map((item) =>
                            item.id === s.id
                              ? { ...item, description: val }
                              : item
                          )
                        );
                      }}
                      className="w-full px-2.5 py-1 text-xs text-medium-black bg-white border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Save Sequence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

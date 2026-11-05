"use client";

import React, { useState } from "react";
import {
  Calendar,
  Phone,
  Smile,
  ShieldAlert,
  Mic,
  Activity,
  MessageSquare,
  Plus,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export const DEFAULT_CONTEXT_INPUTS = [
  {
    id: "lead-type",
    title: "Lead Type",
    subtitle: "Selected 4",
    icon: Calendar,
    checked: true,
  },
  {
    id: "call-stage",
    title: "Call Stage",
    subtitle: "Active Stage",
    icon: Phone,
    checked: true,
  },
  {
    id: "lead-emotion",
    title: "Lead Emotion",
    subtitle: "Detected",
    icon: Smile,
    checked: true,
  },
  {
    id: "objection",
    title: "Objection",
    subtitle: "Detected",
    icon: ShieldAlert,
    checked: true,
  },
  {
    id: "agent-tone",
    title: "Agent Tone",
    subtitle: "Detected",
    icon: Mic,
    checked: false,
  },
  {
    id: "trust-score",
    title: "Trust Score",
    subtitle: "Real-time",
    icon: Activity,
    checked: false,
  },
  {
    id: "previous-exchange",
    title: "Previous Exchange",
    subtitle: "Last 2 Turns",
    icon: MessageSquare,
    checked: false,
  },
];

export default function ContextInputsSection({
  inputs = DEFAULT_CONTEXT_INPUTS,
  onChange = () => {},
}) {
  const [items, setItems] = useState(inputs);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  const handleToggle = (id) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    onChange(updated);
  };

  const handleAddCustomInput = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || "Custom Signal",
      icon: Activity,
      checked: true,
    };
    const updated = [...items, newItem];
    setItems(updated);
    onChange(updated);
    setNewTitle("");
    setNewSubtitle("");
    setIsAddModalOpen(false);
    toast.success("Context input added successfully!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            1
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-dark-black font-secondary flex items-center gap-1.5">
              Context Inputs
              <span className="text-light-black font-normal text-xs sm:text-sm">
                (What the AI considers)
              </span>
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-light-gray text-[10px] font-bold text-medium-black cursor-help"
                title="Choose what information the AI should pay attention to when generating live prompts. For example, you can enable emotional detection to adjust prompts based on how the prospect feels, or disable it if you want the AI to ignore emotions and focus only on what is being said."
                aria-label="About Context Inputs"
              >
                i
              </span>
            </h3>
            <p className="text-xs text-medium-black mt-0.5 font-normal">
              Select the real-time signals and data the AI will use to build prompts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="px-3 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      {/* ── 8 Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {items.map((item) => {
          const IconComponent = item.icon || Activity;
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group select-none ${
                item.checked
                  ? "border-primary/40 bg-teal-50/20 hover:border-primary/60 shadow-2xs"
                  : "border-light-gray bg-white hover:border-medium-black/20"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    item.checked
                      ? "bg-primary/10 text-primary"
                      : "bg-light-gray text-light-black group-hover:text-dark-black"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-dark-black truncate leading-tight font-secondary">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-light-black truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Checked Indicator Icon */}
              {item.checked && (
                <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}

        {/* Add Input Button Card */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="p-3.5 rounded-2xl border border-dashed border-light-gray hover:border-primary/60 bg-white hover:bg-teal-50/20 text-medium-black hover:text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[58px] shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Input</span>
        </button>
      </div>

      {/* ── Edit Context Inputs Modal ── */}
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
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-light-gray overflow-hidden relative my-auto p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-light-gray">
                <div>
                  <h3 className="text-base font-bold text-dark-black font-secondary">
                    Configure Context Inputs
                  </h3>
                  <p className="text-xs text-medium-black mt-0.5">
                    Enable or disable the signals sent to the inference prompt.
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

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-light-gray hover:bg-light-gray/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-light-gray flex items-center justify-center text-medium-black">
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-dark-black">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-light-black">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        item.checked
                          ? "bg-primary border-primary text-white"
                          : "border-light-black/40 bg-white"
                      }`}
                    >
                      {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    toast.success("Context inputs updated!");
                  }}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Custom Input Modal ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-light-gray overflow-hidden relative my-auto p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-light-gray">
                <div>
                  <h3 className="text-base font-bold text-dark-black font-secondary">
                    Add Context Input Signal
                  </h3>
                  <p className="text-xs text-medium-black mt-0.5">
                    Define a new real-time variable for prompt construction.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomInput} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-black/80">
                    Input Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Competitor Mentioned"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-black/80">
                    Sub-label / Detection Rule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Keyword Trigger"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    Add Signal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

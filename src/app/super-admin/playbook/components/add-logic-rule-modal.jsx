"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitBranch, Sparkles } from "lucide-react";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";

const STAGE_OPTIONS = [
  { value: "Opening", label: "Stage 1: Opening" },
  { value: "Discovery", label: "Stage 2: Discovery" },
  { value: "Value Proposition", label: "Stage 3: Value Proposition" },
  { value: "Handle Objections", label: "Stage 4: Handle Objections" },
  { value: "Close", label: "Stage 5: Close" },
  { value: "Follow Up", label: "Stage 6: Follow Up" },
  { value: "Any Stage", label: "All Stages (Global)" },
];

const PRIORITY_OPTIONS = [
  { value: "Normal", label: "Normal Priority" },
  { value: "High", label: "High Priority" },
  { value: "Critical", label: "Critical Priority (Interrupt)" },
];

const AddLogicRuleModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editRule = null,
}) => {
  const isEditing = Boolean(editRule);

  const [stage, setStage] = useState("Discovery");
  const [condition, setCondition] = useState("");
  const [action, setAction] = useState("");
  const [priority, setPriority] = useState("High");

  useEffect(() => {
    if (editRule) {
      setStage(editRule.stage || "Discovery");
      setCondition(editRule.condition || "");
      setAction(editRule.action || "");
      setPriority(editRule.priority || "High");
    } else {
      setStage("Discovery");
      setCondition("");
      setAction("");
      setPriority("High");
    }
  }, [editRule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!condition.trim() || !action.trim()) return;

    onSave({
      id: editRule ? editRule.id : Date.now(),
      stage,
      condition: condition.trim(),
      action: action.trim(),
      priority,
      enabled: editRule ? editRule.enabled : true,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-light-gray shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-light-gray flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark-black/90 font-secondary">
                  {isEditing ? "Edit Logic Rule" : "Add Logic & Routing Rule"}
                </h3>
                <p className="text-xs text-medium-black">
                  Define conditional triggers and automated AI coaching responses.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-light-gray hover:bg-light-gray/40 flex items-center justify-center text-medium-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Target Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-black/80">
                Trigger Stage
              </label>
              <SettingsDropdown
                label="Select Stage"
                items={STAGE_OPTIONS}
                selected={stage}
                onSelect={(val) => setStage(val)}
                className="w-full"
              />
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-black/80">
                IF Condition (Trigger Cue) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. Prospect mentions high price or budget constraints"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/90"
              />
              <p className="text-[11px] text-light-black">
                Voice cue, keyword pattern, or sentiment drop detected during speech.
              </p>
            </div>

            {/* Action */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-black/80">
                THEN Action (AI Prompt Directive) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g. Trigger 'Value & Cost-of-Inaction' reframe prompt with urgency metrics"
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/90 resize-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-black/80">
                Priority Level
              </label>
              <SettingsDropdown
                label="Select Priority"
                items={PRIORITY_OPTIONS}
                selected={priority}
                onSelect={(val) => setPriority(val)}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-gray">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-medium-black cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEditing ? "Save Changes" : "Create Rule"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddLogicRuleModal;

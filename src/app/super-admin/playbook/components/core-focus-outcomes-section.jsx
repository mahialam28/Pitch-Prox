"use client";

import React, { useState } from "react";
import {
  Target,
  Check,
  Plus,
  X,
  GripVertical,
  Trash2,
  ChevronDown,
} from "lucide-react";
import Text from "@/components/texts/text";
import AddFocusModal from "./add-focus-modal";
import AddTagModal from "./add-tag-modal";

const initialFocusAreas = [
  { id: "build-trust", label: "Build Trust", defaultSelected: true },
  { id: "uncover-needs", label: "Uncover Needs", defaultSelected: true },
  { id: "objection-handling", label: "Objection Handling", defaultSelected: true },
  { id: "increase-appointments", label: "Increase Appointments", defaultSelected: false },
  { id: "close-more-deals", label: "Close More Deals", defaultSelected: false },
  { id: "long-term-relationships", label: "Long-Term Relationships", defaultSelected: false },
];

const initialOutcomes = [
  { id: 1, text: "How to build instant credibility and trust" },
  { id: 2, text: "Value-driven questioning to uncover real needs" },
  { id: 3, text: "Objection handling with confidence and clarity" },
  { id: 4, text: "Closing techniques used by top entrepreneurs and investors" },
];

const initialTags = ["Premium", "Investor Style", "Authority Based"];

const CoreFocusOutcomesSection = ({
  formData,
  onChange = () => {},
}) => {
  const [focusAreas, setFocusAreas] = useState(initialFocusAreas);
  const [selectedFocus, setSelectedFocus] = useState(
    formData.focusAreas || ["build-trust", "uncover-needs", "objection-handling"]
  );
  const [internalTags, setInternalTags] = useState(
    formData.internalTags || initialTags
  );
  const [outcomes, setOutcomes] = useState(
    formData.keyOutcomes || initialOutcomes
  );
  const [internalNotes, setInternalNotes] = useState(
    formData.internalNotes ||
      "This playbook uses the Herjavec framework with a trust-first approach. Focus on value, transparency and confidence."
  );

  // Modal states
  const [showAddFocusModal, setShowAddFocusModal] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [isAddingOutcome, setIsAddingOutcome] = useState(false);
  const [newOutcomeText, setNewOutcomeText] = useState("");

  const toggleFocusArea = (id) => {
    let updated;
    if (selectedFocus.includes(id)) {
      updated = selectedFocus.filter((item) => item !== id);
    } else {
      if (selectedFocus.length >= 3) {
        // max 3
        updated = [...selectedFocus.slice(1), id];
      } else {
        updated = [...selectedFocus, id];
      }
    }
    setSelectedFocus(updated);
    onChange("focusAreas", updated);
  };

  const handleAddCustomFocus = (label) => {
    const id = label.toLowerCase().replace(/\s+/g, "-");
    if (!focusAreas.some((f) => f.id === id)) {
      setFocusAreas((prev) => [...prev, { id, label, defaultSelected: false }]);
      toggleFocusArea(id);
    }
    setShowAddFocusModal(false);
  };

  const removeTag = (tagToRemove) => {
    const updated = internalTags.filter((t) => t !== tagToRemove);
    setInternalTags(updated);
    onChange("internalTags", updated);
  };

  const handleAddTag = (newTag) => {
    if (newTag && !internalTags.includes(newTag)) {
      const updated = [...internalTags, newTag];
      setInternalTags(updated);
      onChange("internalTags", updated);
    }
    setShowAddTagModal(false);
  };

  const removeOutcome = (id) => {
    const updated = outcomes.filter((o) => o.id !== id);
    setOutcomes(updated);
    onChange("keyOutcomes", updated);
  };

  const handleAddOutcome = () => {
    if (newOutcomeText.trim()) {
      const updated = [
        ...outcomes,
        { id: Date.now(), text: newOutcomeText.trim() },
      ];
      setOutcomes(updated);
      onChange("keyOutcomes", updated);
      setNewOutcomeText("");
      setIsAddingOutcome(false);
    }
  };

  const handleNotesChange = (val) => {
    setInternalNotes(val);
    onChange("internalNotes", val);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-sky-50 text-sky-600 shrink-0">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
            Core Focus & Outcomes
          </h2>
          <Text variant="smaller" className="text-medium-black mt-0.5">
            What this playbook helps the user achieve.
          </Text>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-1 items-start">
        {/* LEFT COLUMN: Primary Focus Areas & Internal Tags */}
        <div className="space-y-6">
          {/* Primary Focus Areas */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-medium text-medium-black">
                Primary Focus Areas{" "}
                <span className="text-light-black font-normal">
                  (Select up to 3)
                </span>
              </label>
              <span className="text-[11px] font-semibold text-primary">
                {selectedFocus.length}/3 selected
              </span>
            </div>

            {/* Focus area pill buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {focusAreas.map((area) => {
                const isSelected = selectedFocus.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => toggleFocusArea(area.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer text-left ${
                      isSelected
                        ? "bg-primary/5 border-primary text-primary font-semibold shadow-2xs"
                        : "bg-white border-light-gray text-medium-black hover:text-dark-black/90 hover:border-primary/40 hover:bg-light-gray/30 font-medium"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? "bg-primary text-white"
                          : "border border-light-black/40"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{area.label}</span>
                  </button>
                );
              })}
            </div>

            {/* + Add Focus Area Button */}
            <button
              type="button"
              onClick={() => setShowAddFocusModal(true)}
              className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Focus Area</span>
            </button>
          </div>

          {/* Internal Tags */}
          <div>
            <label className="block text-xs font-medium text-medium-black mb-1.5">
              Internal Tags
            </label>
            <div className="p-2.5 rounded-xl border border-light-gray bg-white flex flex-wrap items-center justify-between gap-2 min-h-[46px]">
              <div className="flex flex-wrap items-center gap-1.5">
                {internalTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-light-gray/80 hover:bg-light-gray border border-light-gray text-medium-black text-xs font-medium rounded-lg transition-colors"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-light-black hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <ChevronDown className="w-4 h-4 text-light-black shrink-0" />
            </div>

            {/* + Add Tag Button */}
            <button
              type="button"
              onClick={() => setShowAddTagModal(true)}
              className="mt-2.5 px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tag</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Key Outcomes & Internal Notes */}
        <div className="space-y-6">
          {/* Key Outcomes */}
          <div>
            <label className="block text-xs font-medium text-medium-black mb-2.5">
              Key Outcomes{" "}
              <span className="text-light-black font-normal">
                (What the user will achieve)
              </span>
            </label>

            {/* Outcomes List */}
            <div className="space-y-2.5">
              {outcomes.map((outcome) => (
                <div
                  key={outcome.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-light-gray bg-light-gray/30 hover:bg-white hover:border-light-gray transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <GripVertical className="w-4 h-4 text-light-black shrink-0 cursor-grab active:cursor-grabbing" />
                    <span className="text-xs sm:text-sm font-normal text-dark-black/80 leading-snug truncate">
                      {outcome.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOutcome(outcome.id)}
                    className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    aria-label="Delete outcome"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Outcome Inline Form / Button */}
            {isAddingOutcome ? (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={newOutcomeText}
                  onChange={(e) => setNewOutcomeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOutcome();
                    }
                  }}
                  placeholder="e.g. Master handling pricing objections"
                  className="flex-1 px-3 py-2 rounded-xl border border-primary text-xs sm:text-sm focus:outline-none text-dark-black/80"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddOutcome}
                  className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-medium-teal cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingOutcome(false);
                    setNewOutcomeText("");
                  }}
                  className="px-2.5 py-2 rounded-xl border border-light-gray text-light-black text-xs hover:bg-light-gray cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingOutcome(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Outcome</span>
              </button>
            )}
          </div>

          {/* Internal Notes (Visible only to admins) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-medium-black">
                Internal Notes{" "}
                <span className="text-light-black font-normal">
                  (Visible only to admins)
                </span>
              </label>
              <span className="text-[11px] font-normal text-light-black">
                {internalNotes.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={internalNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Internal instructions or strategic notes for administrators..."
              className="w-full px-4 py-2.5 rounded-xl border border-light-gray bg-white text-dark-black/80 text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-light-black resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddFocusModal
        isOpen={showAddFocusModal}
        onClose={() => setShowAddFocusModal(false)}
        onAdd={handleAddCustomFocus}
      />
      <AddTagModal
        isOpen={showAddTagModal}
        onClose={() => setShowAddTagModal(false)}
        onAdd={handleAddTag}
      />
    </div>
  );
};

export default CoreFocusOutcomesSection;

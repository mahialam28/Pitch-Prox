"use client";

import React, { useState } from "react";
import { Check, Plus, Smile, MessageCircle, Leaf, Target, Heart, User, Sparkles } from "lucide-react";
import AddToneModal from "./add-tone-modal";

const initialTones = [
  { id: "confident", label: "Confident", icon: Smile },
  { id: "friendly", label: "Friendly", icon: MessageCircle },
  { id: "calm", label: "Calm", icon: Leaf },
  { id: "direct", label: "Direct", icon: Target },
  { id: "empathetic", label: "Empathetic", icon: Heart },
  { id: "authoritative", label: "Authoritative", icon: User },
];

const ToneSelection = ({
  selectedTones = ["confident"],
  onChange = () => {},
}) => {
  const [tones, setTones] = useState(initialTones);
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleTone = (id) => {
    let updated;
    if (selectedTones.includes(id)) {
      if (selectedTones.length > 1) {
        updated = selectedTones.filter((t) => t !== id);
      } else {
        return; // at least 1 selected
      }
    } else {
      if (selectedTones.length >= 3) {
        updated = [...selectedTones.slice(1), id];
      } else {
        updated = [...selectedTones, id];
      }
    }
    onChange(updated);
  };

  const handleAddTone = (newTone) => {
    if (!tones.some((t) => t.id === newTone.id)) {
      setTones((prev) => [...prev, { ...newTone, icon: Sparkles }]);
      toggleTone(newTone.id);
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-medium-black">
          Overall Tone{" "}
          <span className="text-light-black font-normal">
            (Select up to 3)
          </span>
        </label>
        <span className="text-[11px] font-semibold text-primary">
          {selectedTones.length}/3 selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {tones.map((tone) => {
          const isSelected = selectedTones.includes(tone.id);
          const IconComp = tone.icon || Smile;
          return (
            <button
              key={tone.id}
              type="button"
              onClick={() => toggleTone(tone.id)}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-primary/5 border-primary text-primary font-semibold shadow-2xs"
                  : "bg-white border-light-gray text-medium-black hover:text-dark-black/90 hover:border-primary/40 hover:bg-light-gray/20 font-medium"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-medium-black"}`} />
                <span className="truncate">{tone.label}</span>
              </div>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  isSelected
                    ? "bg-primary text-white"
                    : "border border-light-black/40"
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}

        {/* + Add Additional Tone Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Additional Tone</span>
        </button>
      </div>

      <AddToneModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTone}
      />
    </div>
  );
};

export default ToneSelection;

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, GripVertical, ChevronUp, ChevronDown, Mic, Heart, RotateCw, FileText } from "lucide-react";

const DEFAULT_STEPS = [
  { id: "acknowledge", label: "Acknowledge", icon: Mic },
  { id: "validate", label: "Validate", icon: Heart },
  { id: "reframe", label: "Reframe", icon: RotateCw },
  { id: "guide", label: "Guide Forward", icon: FileText },
];

const STEP_ICONS = { Mic, Heart, RotateCw, FileText };

const FrameworkEditModal = ({ isOpen, onClose, onSave, steps: initialSteps }) => {
  // Initialize from props; parent remounts this modal (via key) each time it opens
  const [steps, setSteps] = useState(initialSteps || DEFAULT_STEPS);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  // Lock scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const moveUp = useCallback(
    (index) => {
      if (index === 0) return;
      setSteps((prev) => {
        const updated = [...prev];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        return updated;
      });
    },
    []
  );

  const moveDown = useCallback(
    (index) => {
      if (index === steps.length - 1) return;
      setSteps((prev) => {
        const updated = [...prev];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        return updated;
      });
    },
    [steps.length]
  );

  // ── Drag & Drop handlers (mouse) ──
  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    // Needed for Firefox to initiate the drag
    e.dataTransfer.setData("text/html", e.target.closest("div")?.innerHTML || "");
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && index !== dragIndex) {
      setDropIndex(index);
    }
  }, [dragIndex]);

  const handleDrop = useCallback(
    (e, index) => {
      e.preventDefault();
      if (dragIndex === null) return;
      const from = dragIndex;
      const to = index;
      if (from !== to) {
        setSteps((prev) => {
          const updated = [...prev];
          const [moved] = updated.splice(from, 1);
          updated.splice(to, 0, moved);
          return updated;
        });
      }
      setDragIndex(null);
      setDropIndex(null);
    },
    [dragIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
  }, []);

  const handleSave = () => {
    onSave(steps);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-light-gray shrink-0">
          <div>
            <h2 className="text-lg font-bold text-dark-black">Edit Response Sequence</h2>
            <p className="text-xs text-light-black mt-0.5">
              Drag steps to reorder — or use the arrows
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm text-light-black hover:text-dark-black hover:bg-light-gray transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto overflow-x-hidden px-6 py-5 flex-1">
          <div className="space-y-2">
            {steps.map((step, idx) => {
              const StepIcon = typeof step.icon === "string" ? STEP_ICONS[step.icon] || Mic : step.icon || Mic;
              const isDragging = dragIndex === idx;
              const isDropTarget = dropIndex === idx && dragIndex !== null && dropIndex !== dragIndex;
              return (
                <div
                  key={step.id}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border bg-white transition-all duration-150 group ${
                    isDragging
                      ? "border-primary/60 border-dashed opacity-60 shadow-sm"
                      : isDropTarget
                        ? "border-primary border-dashed bg-primary/5 ring-2 ring-primary/20"
                        : "border-light-gray hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  {/* Grip / Reorder handle (drag source) */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    className={`shrink-0 p-0.5 -m-0.5 text-light-black/40 group-hover:text-medium-black transition cursor-grab active:cursor-grabbing select-none ${
                      isDragging ? "cursor-grabbing text-primary" : ""
                    }`}
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Step number */}
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>

                  {/* Icon */}
                  <div className="p-2 rounded-xl bg-light-teal/60 text-primary shrink-0">
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Label */}
                  <span className="text-sm font-semibold text-dark-black flex-1">{step.label}</span>

                  {/* Up / Down Arrows */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveUp(idx)}
                      className="p-1.5 rounded-lg text-light-black hover:bg-light-gray disabled:opacity-20 disabled:hover:bg-transparent transition cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => moveDown(idx)}
                      className="p-1.5 rounded-lg text-light-black hover:bg-light-gray disabled:opacity-20 disabled:hover:bg-transparent transition cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-light-gray shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border-2 border-light-gray text-medium-black font-semibold text-xs hover:bg-light-gray transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-medium-teal shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            Save Sequence
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrameworkEditModal;

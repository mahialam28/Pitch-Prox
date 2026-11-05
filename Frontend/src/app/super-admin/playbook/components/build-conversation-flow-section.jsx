"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Plus,
  RotateCcw,
  Info,
} from "lucide-react";
import ConversationStageCard from "./conversation-stage-card";
import AddStageModal, { STAGE_ICONS } from "./add-stage-modal";

export const DEFAULT_STAGES = [
  {
    id: 1,
    title: "Opening",
    description: "Create rapport and get permission to have a conversation.",
    goal: "Engage the lead and open the door for conversation.",
    iconId: "opening",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    id: 2,
    title: "Discovery",
    description: "Ask the right questions to uncover their situation and needs.",
    goal: "Understand their challenges, goals, and timeline.",
    iconId: "discovery",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: 3,
    title: "Value Proposition",
    description: "Present your value, expertise, and how you solve their problems.",
    goal: "Differentiate yourself and show clear value.",
    iconId: "value-prop",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    id: 4,
    title: "Handle Objections",
    description: "Address concerns with empathy and confidence.",
    goal: "Remove hesitation and rebuild confidence.",
    iconId: "objections",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: 5,
    title: "Close",
    description: "Guide them to commit to the next logical step.",
    goal: "Secure commitment to a call, appointment, or action.",
    iconId: "close",
    color: "text-teal-600 bg-teal-50 border-teal-200",
  },
  {
    id: 6,
    title: "Follow Up",
    description: "Reinforce value and move the conversation forward.",
    goal: "Stay top of mind and convert later.",
    iconId: "follow-up",
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
];

const BuildConversationFlowSection = ({
  stages = DEFAULT_STAGES,
  onChange = () => {},
  onResetDefaults = () => {},
}) => {
  const [stageList, setStageList] = useState(stages);
  const [dragIndex, setDragIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) return;

    const updated = [...stageList];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(targetIndex, 0, dragged);

    // Re-index IDs
    const reindexed = updated.map((item, i) => ({
      ...item,
      id: i + 1,
    }));

    setStageList(reindexed);
    onChange(reindexed);
    setDragIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleOpenAdd = () => {
    setEditingStage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stage) => {
    setEditingStage(stage);
    setIsModalOpen(true);
  };

  const handleDelete = (stageId) => {
    const filtered = stageList
      .filter((s) => s.id !== stageId)
      .map((item, i) => ({ ...item, id: i + 1 }));
    setStageList(filtered);
    onChange(filtered);
  };

  const handleSaveStage = (stageData) => {
    let updated;
    if (stageData.id) {
      updated = stageList.map((s) =>
        s.id === stageData.id ? { ...s, ...stageData } : s
      );
    } else {
      updated = [
        ...stageList,
        {
          ...stageData,
          id: stageList.length + 1,
        },
      ];
    }
    setStageList(updated);
    onChange(updated);
  };

  const handleReset = () => {
    setStageList(DEFAULT_STAGES);
    onResetDefaults();
    onChange(DEFAULT_STAGES);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
              Build Your Conversation Flow
            </h2>
            <p className="text-xs text-medium-black mt-0.5 font-normal">
              Define the stages of your calls and what the AI should help the agent accomplish.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl border border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stage</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 text-medium-black hover:text-dark-black bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        </div>
      </div>

      {/* Stage Cards List */}
      <div className="space-y-3 pt-1">
        {stageList.map((stage, idx) => (
          <ConversationStageCard
            key={stage.id}
            stage={stage}
            index={idx}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            isDragging={dragIndex === idx}
          />
        ))}
      </div>

      {/* + Add Custom Stage Dashed Box */}
      <button
        type="button"
        onClick={handleOpenAdd}
        className="w-full py-3 px-4 rounded-xl border border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add Custom Stage</span>
      </button>

      {/* Bottom Tip Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="font-normal">
          <strong className="font-semibold">Tip:</strong> Drag and drop to reorder stages. These stages will guide the AI prompts in every call.
        </span>
      </div>

      {/* Modal */}
      <AddStageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStage}
        editStage={editingStage}
      />
    </div>
  );
};

export default BuildConversationFlowSection;

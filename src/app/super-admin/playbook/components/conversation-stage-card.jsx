"use client";

import React from "react";
import {
  GripVertical,
  Pencil,
  Trash2,
  Smile,
  Search,
  Gem,
  ShieldCheck,
  Target,
  PhoneCall,
  Sparkles,
} from "lucide-react";

const ICON_MAP = {
  opening: Smile,
  discovery: Search,
  "value-prop": Gem,
  "value proposition": Gem,
  objections: ShieldCheck,
  "handle objections": ShieldCheck,
  close: Target,
  "follow-up": PhoneCall,
  "follow up": PhoneCall,
};

const COLOR_MAP = {
  opening: "text-emerald-600 bg-emerald-50 border-emerald-200",
  discovery: "text-blue-600 bg-blue-50 border-blue-200",
  "value-prop": "text-purple-600 bg-purple-50 border-purple-200",
  "value proposition": "text-purple-600 bg-purple-50 border-purple-200",
  objections: "text-amber-600 bg-amber-50 border-amber-200",
  "handle objections": "text-amber-600 bg-amber-50 border-amber-200",
  close: "text-teal-600 bg-teal-50 border-teal-200",
  "follow-up": "text-rose-600 bg-rose-50 border-rose-200",
  "follow up": "text-rose-600 bg-rose-50 border-rose-200",
};

const ConversationStageCard = ({
  stage,
  index,
  onEdit = () => {},
  onDelete = () => {},
  onDragStart = () => {},
  onDragOver = () => {},
  onDrop = () => {},
  onDragEnd = () => {},
  isDragging = false,
}) => {
  const normalizedKey = stage.iconId || stage.title?.toLowerCase().trim() || "opening";
  const IconComp = ICON_MAP[normalizedKey] || stage.icon || Smile;
  const colorClass = stage.color || COLOR_MAP[normalizedKey] || "text-teal-600 bg-teal-50 border-teal-200";

  return (
    <div
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`w-full bg-white rounded-2xl p-3.5 sm:p-4 border border-light-gray hover:border-medium-black/25 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group ${
        isDragging ? "opacity-50 border-primary border-dashed bg-primary/5" : ""
      }`}
    >
      {/* Left side: Grip + Icon + Number + Title & Desc */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag handle */}
        <div
          draggable
          onDragStart={(e) => onDragStart(e, index)}
          className="text-light-black/50 hover:text-dark-black p-1 cursor-grab active:cursor-grabbing transition-colors shrink-0 select-none"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Icon Circle */}
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}
        >
          <IconComp className="w-4 h-4" />
        </div>

        {/* Number Badge */}
        <div className="w-6 h-6 rounded-lg bg-light-gray/70 text-medium-black text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </div>

        {/* Title and Short Description */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 truncate font-secondary">
            {stage.title}
          </h4>
          <p className="text-[11px] text-light-black font-normal truncate mt-0.5">
            {stage.description}
          </p>
        </div>
      </div>

      {/* Right side: Goal box + Edit / Delete Actions */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
        {/* Goal Capsule / Box */}
        <div className="px-3.5 py-1.5 rounded-xl bg-light-gray/40 border border-light-gray/80 max-w-[280px] sm:max-w-[340px] truncate">
          <span className="text-[11px] font-medium text-dark-black/80 truncate block">
            {stage.goal?.startsWith("Goal:") ? stage.goal : `Goal: ${stage.goal}`}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(stage)}
            className="p-1.5 rounded-lg border border-light-gray hover:border-primary/40 bg-white hover:bg-light-gray/30 text-light-black hover:text-dark-black transition-colors cursor-pointer"
            aria-label={`Edit ${stage.title}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(stage.id)}
            className="p-1.5 rounded-lg border border-light-gray hover:border-rose-200 bg-white hover:bg-rose-50 text-light-black hover:text-rose-500 transition-colors cursor-pointer"
            aria-label={`Delete ${stage.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationStageCard;

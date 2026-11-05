"use client";

import React, { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const DEFAULT_INSTRUCTIONS = `Always build trust first, then address the need.
Keep responses short, natural, and easy to say out loud.
Use the user's style: Confident, Consultative, Professional.
Guide the conversation forward. Never end the call.
Address the objection directly, then pivot to value or questions.`;

export default function InstructionSetSection({
  instructions = DEFAULT_INSTRUCTIONS,
  onChange = () => {},
}) {
  const [content, setContent] = useState(instructions);
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(instructions);

  const handleSave = () => {
    setContent(tempContent);
    onChange(tempContent);
    setIsEditing(false);
    toast.success("Instruction set updated successfully!");
  };

  const handleCancel = () => {
    setTempContent(content);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            2
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-dark-black font-secondary flex items-center gap-1.5">
              Instruction Set
              <span className="text-light-black font-normal text-xs sm:text-sm">
                (How the AI should behave)
              </span>
            </h3>
            <p className="text-xs text-medium-black mt-0.5 font-normal">
              Define the core instructions that guide the AI&apos;s responses and coaching.
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => {
              setTempContent(content);
              setIsEditing(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-2.5 py-1.5 rounded-xl border border-light-gray text-medium-black hover:text-dark-black text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Instruction Box ── */}
      <div className="relative">
        {isEditing ? (
          <textarea
            rows={5}
            maxLength={1000}
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            className="w-full p-4 pb-7 rounded-2xl bg-white border border-primary ring-2 ring-primary/20 text-xs sm:text-sm font-normal text-dark-black/90 focus:outline-none resize-none leading-relaxed transition-all"
            placeholder="Define instructions for the AI model..."
          />
        ) : (
          <div className="w-full p-4 pb-7 rounded-2xl bg-light-gray/30 border border-light-gray/70 text-xs sm:text-sm font-normal text-dark-black/90 whitespace-pre-line leading-relaxed">
            {content}
          </div>
        )}

        {/* Character Count */}
        <div className="absolute right-3.5 bottom-2 text-[10px] text-light-black font-medium pointer-events-none">
          {isEditing ? tempContent.length : content.length}/1000
        </div>
      </div>
    </div>
  );
}

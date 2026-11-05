"use client";

import React from "react";
import { Lock } from "lucide-react";
import Text from "@/components/texts/text";

export const AiGuideline = ({ onOpenModal }) => {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-light-gray shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Subtle gradient decoration */}
      <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-gradient-to-bl from-teal-400/6 via-emerald-300/4 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 border border-light-gray rounded-xl text-light-black shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <Text variant="smaller" className="!text-dark-black/80 font-medium !tracking-normal">
          Secure &amp; private. Your content is only used to train your AI and is never shared.
        </Text>
      </div>

      <button
        type="button"
        onClick={onOpenModal}
        className="relative z-10 text-xs font-semibold text-primary hover:text-medium-teal transition cursor-pointer shrink-0"
      >
        View Training Guidelines
      </button>
    </div>
  );
};

export default AiGuideline;
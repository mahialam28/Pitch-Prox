"use client";

import React from "react";
import { Headphones } from "lucide-react";
import Text from "@/components/texts/text";

export const NeedHelpCard = ({ onCreateTicket }) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[220px]">
      {/* Support Icon */}
      <div className="w-12 h-12 rounded-full bg-light-teal text-primary flex items-center justify-center mb-3.5 shadow-xs">
        <Headphones className="w-6 h-6" />
      </div>

      {/* Title & Support Schedule */}
      <Text variant="regular" className="font-bold text-dark-black mb-1">
        Need help?
      </Text>
      <Text variant="small" className="text-light-black leading-relaxed">
        Our support team is here
      </Text>
      <Text variant="small" className="text-light-black leading-relaxed mb-5">
        Mon - Fri, 6am - 6pm PST
      </Text>

      {/* Action Button */}
      <button
        type="button"
        onClick={onCreateTicket}
        className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 cursor-pointer shadow-sm text-center"
      >
        Create new support ticket
      </button>
    </div>
  );
};

export default NeedHelpCard;

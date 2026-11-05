"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import DatePicker from "@/components/modals/date-picker";

const investigatorOptions = [
  {
    name: "Daniel Miller",
    role: "Security Administrator",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
  },
  {
    name: "Sarah Johnson",
    role: "Security Lead",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
  },
  {
    name: "Alex Rodriguez",
    role: "Compliance Officer",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=140",
  },
];

export default function InvestigationResult({
  investigationData,
  onChange,
}) {
  const [isInvestigatorOpen, setIsInvestigatorOpen] = useState(false);
  const investigatorDropdownRef = useRef(null);

  // Click outside to close investigator dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        investigatorDropdownRef.current &&
        !investigatorDropdownRef.current.contains(event.target)
      ) {
        setIsInvestigatorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedInvestigator =
    investigatorOptions.find(
      (opt) => opt.name === investigationData.investigatedBy?.name
    ) || investigatorOptions[0];

  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 p-5 sm:p-6 shadow-xs flex flex-col gap-5 w-full">
      {/* Title */}
      <h3 className="text-base font-bold text-dark-black/90 font-secondary">
        Investigation Result
      </h3>

      {/* Field 1: Investigation Findings */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-dark-black/75 block">
          Investigation Findings
        </label>
        <textarea
          rows={3}
          value={investigationData.investigationFindings || ""}
          onChange={(e) =>
            onChange({
              ...investigationData,
              investigationFindings: e.target.value,
            })
          }
          placeholder="Enter investigation findings..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal resize-none shadow-2xs leading-relaxed"
        />
      </div>

      {/* Field 2: Actions Taken */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-dark-black/75 block">
          Actions Taken
        </label>
        <textarea
          rows={2}
          value={investigationData.actionsTaken || ""}
          onChange={(e) =>
            onChange({
              ...investigationData,
              actionsTaken: e.target.value,
            })
          }
          placeholder="Describe actions taken..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal resize-none shadow-2xs leading-relaxed"
        />
      </div>

      {/* Field 3: Final Conclusion */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-dark-black/75 block">
          Final Conclusion
        </label>
        <textarea
          rows={2}
          value={investigationData.finalConclusion || ""}
          onChange={(e) =>
            onChange({
              ...investigationData,
              finalConclusion: e.target.value,
            })
          }
          placeholder="State the final conclusion..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal resize-none shadow-2xs leading-relaxed"
        />
      </div>

      {/* Bottom Row: Investigated by & Investigation date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Investigated by - Opens towards top */}
        <div className="space-y-1.5 relative" ref={investigatorDropdownRef}>
          <label className="text-xs font-semibold text-dark-black/75 block">
            Investigated by
          </label>
          <button
            type="button"
            onClick={() => setIsInvestigatorOpen(!isInvestigatorOpen)}
            className={`w-full h-12 flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-white text-xs transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/60 ${
              isInvestigatorOpen
                ? "border-primary ring-2 ring-primary/20 shadow-xs"
                : "border-light-gray"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-light-gray shrink-0">
                <Image
                  src={selectedInvestigator.avatar}
                  alt={selectedInvestigator.name}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="truncate text-medium-black font-medium">{selectedInvestigator.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0 ml-2" />
          </button>

          {/* Top Dropdown Popover */}
          {isInvestigatorOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30">
              {investigatorOptions.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => {
                    onChange({
                      ...investigationData,
                      investigatedBy: opt,
                    });
                    setIsInvestigatorOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    selectedInvestigator.name === opt.name
                      ? "bg-primary/5 text-primary font-semibold"
                      : "hover:bg-light-gray/50 text-medium-black"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-light-gray">
                    <Image
                      src={opt.avatar}
                      alt={opt.name}
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="truncate">{opt.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Investigation date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-dark-black/75 block">
            Investigation date
          </label>
          <DatePicker
            value={investigationData.investigationDate || "2024-05-20"}
            onChange={(val) =>
              onChange({
                ...investigationData,
                investigationDate: val,
              })
            }
            placeholder="Select date"
            placement="top"
          />
        </div>
      </div>
    </div>
  );
}

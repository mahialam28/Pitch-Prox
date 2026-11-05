import React from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  BarChart2,
  Phone,
  FileText,
  FileEdit,
  Sliders,
  Settings,
  Clock,
} from "lucide-react";

const tabsList = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "performance", label: "Performance", icon: BarChart2 },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "coaching-notes", label: "Coaching Notes", icon: FileEdit },
  { id: "calibration", label: "Calibration", icon: Sliders },
  { id: "account-settings", label: "Account Settings", icon: Settings },
  { id: "activity-log", label: "Activity Log", icon: Clock },
];

export default function RepNavTabs({ activeTab, onTabChange }) {
  return (
    <div className="w-full border-b border-light-gray flex items-center gap-6 sm:gap-7 overflow-x-auto select-none pt-1 [-ms-overflow-style:none] [scrollbar-width:none]">
      {tabsList.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative pb-3 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none whitespace-nowrap flex items-center gap-2 ${
              isActive
                ? "text-primary font-bold"
                : "text-light-black hover:text-dark-black"
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-primary stroke-[2.2]" : "text-light-black"
                }`}
              />
            )}
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeRepProfileTabUnderline"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

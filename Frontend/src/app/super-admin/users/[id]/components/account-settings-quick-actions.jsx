"use client";

import React from "react";
import {
  RotateCcw,
  Eye,
  Slash,
  ChevronRight,
} from "lucide-react";

export default function AccountSettingsQuickActions({
  onActionClick = () => {},
}) {
  const actions = [
    {
      id: "reset_calibration",
      label: "Reset Calibration",
      icon: RotateCcw,
    },
    {
      id: "view_login_activity",
      label: "View Login Activity",
      icon: Eye,
    },
    {
      id: "deactivate_account",
      label: "Deactivate Account",
      icon: Slash,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="pb-3 border-b border-light-gray/70">
        <h3 className="text-base font-bold text-dark-black/85">
          Quick Actions
        </h3>
      </div>

      {/* Action Buttons List */}
      <div className="flex flex-col gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onActionClick(act.id)}
              className="w-full p-3 rounded-xl border border-light-gray/80 bg-white hover:bg-light-gray/40 text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-light-black group-hover:text-primary transition-colors shrink-0" />
                <span>{act.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-light-black/60 group-hover:text-primary transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

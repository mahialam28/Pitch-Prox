"use client";

import React from "react";
import {
  ChevronRight,
  RefreshCw,
  Calendar,
  Pause,
  History,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

const actions = [
  {
    id: "change_plan",
    title: "Change Plan",
    subtitle: "Upgrade, downgrade or switch plan",
    icon: RefreshCw,
    iconColor: "text-blue-500 bg-blue-50",
  },
  {
    id: "extend_subscription",
    title: "Extend Subscription",
    subtitle: "Extend Subscription expiration",
    icon: Calendar,
    iconColor: "text-indigo-500 bg-indigo-50",
  },
  {
    id: "pause_subscription",
    title: "Pause Subscription",
    subtitle: "Temporarily pause billing",
    icon: Pause,
    iconColor: "text-sky-500 bg-sky-50",
  },
  {
    id: "view_call_history",
    title: "View Call History",
    subtitle: "Review call records & analytics",
    icon: History,
    iconColor: "text-purple-500 bg-purple-50",
  },
  {
    id: "view_activity_log",
    title: "View Activity Log",
    subtitle: "Audit trail and event records",
    icon: Activity,
    iconColor: "text-teal-600 bg-teal-50",
  },
];

const QuickActions = ({ onActionClick }) => {
  const handleActionClick = (action) => {
    if (onActionClick) {
      onActionClick(action.id);
    } else {
      toast.success(`Action initiated: ${action.title}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* ── Header: Title & Chevron ── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight">
          Quick Actions
        </h3>
        <ChevronRight className="w-4 h-4 text-light-black" />
      </div>

      {/* ── Action Items List ── */}
      <div className="divide-y divide-light-gray/60 flex-1 flex flex-col justify-between gap-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleActionClick(action)}
              className="w-full py-2.5 sm:py-3 px-2 sm:px-2.5 flex items-center justify-between gap-3 hover:bg-light-gray/40 rounded-xl transition-colors text-left cursor-pointer group"
            >
              {/* Left: Colored Icon Box + Texts */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${action.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-[13px] text-dark-black/85 group-hover:text-primary transition-colors leading-tight">
                    {action.title}
                  </p>
                  {action.subtitle && (
                    <p className="text-[10px] sm:text-[11px] text-light-black truncate mt-0.5">
                      {action.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Chevron Arrow */}
              <ChevronRight className="w-3.5 h-3.5 text-light-black group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;


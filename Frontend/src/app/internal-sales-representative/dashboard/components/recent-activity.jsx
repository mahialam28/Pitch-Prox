"use client";

import React from "react";
import { ArrowUpCircle, UserCheck, DollarSign, XCircle } from "lucide-react";

const activitiesData = [
  {
    id: "1",
    title: "Acme Inc. upgraded to Pro Plan",
    time: "2m ago",
    icon: ArrowUpCircle,
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "2",
    title: "Robert Chen closed a new subscription",
    time: "15m ago",
    icon: UserCheck,
    iconColor: "text-emerald-600 bg-emerald-50",
  },
  {
    id: "3",
    title: "Jennifer Smith purchased 10 report credits",
    time: "1h ago",
    icon: DollarSign,
    iconColor: "text-orange-500 bg-orange-50",
  },
  {
    id: "4",
    title: "Global Solutions canceled their subscription",
    time: "2h ago",
    icon: XCircle,
    iconColor: "text-indigo-500 bg-indigo-50",
  },
];

const ACTION_ICONS = {
  "customer.created": [UserCheck, "text-emerald-600 bg-emerald-50"],
  "customer.activated": [ArrowUpCircle, "text-blue-600 bg-blue-50"],
  "offboarding.completed": [XCircle, "text-rose-500 bg-rose-50"],
};
const ago = (value) => {
  const minutes = Math.round((Date.now() - new Date(value)) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
};

// activity: audit entries from the dashboard API
const RecentActivity = ({ activity } = {}) => {
  const items = activity
    ? activity.map((entry) => {
        const [icon, iconColor] = ACTION_ICONS[entry.action] ?? [DollarSign, "text-amber-600 bg-amber-50"];
        return { id: entry.id, title: entry.summary, time: ago(entry.createdAt), icon, iconColor };
      })
    : activitiesData;
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Recent Activity
        </h3>
      </div>

      {/* Activity List */}
      <div className="space-y-3.5">
        {!items.length && <p className="text-xs text-light-black">No activity yet.</p>}
        {items.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activity.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-dark-black/80 truncate text-xs">
                  {activity.title}
                </span>
              </div>
              <span className="text-[11px] text-light-black shrink-0 font-normal">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;

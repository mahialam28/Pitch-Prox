"use client";

import React from "react";
import { Edit3, Send, UploadCloud } from "lucide-react";

export const OVERVIEW_ACTIVITIES = [
  {
    id: "1",
    title: 'Journey "Upgrade Push" was edited',
    author: "Daniel Miller",
    timeAgo: "1 hour ago",
    icon: Edit3,
    iconColor: "text-blue-500 bg-blue-50 border-blue-100",
  },
  {
    id: "2",
    title: 'Campaign "Product Update - May" scheduled',
    author: "Sarah Johnson",
    timeAgo: "3 hours ago",
    icon: Send,
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    id: "3",
    title: 'Template "Trial Reminder" updated',
    author: "Emily Brown",
    timeAgo: "5 hours ago",
    icon: UploadCloud,
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
];

export const LIFECYCLE_ACTIVITIES = [
  {
    id: "1",
    title: 'Journey "Trial Onboarding" was edited',
    author: "Daniel Miller",
    timeAgo: "1 hour ago",
  },
  {
    id: "2",
    title: 'Journey "Lead Nurture" started',
    author: "Sarah Johnson",
    timeAgo: "2 hours ago",
  },
  {
    id: "3",
    title: 'Journey "Trial Expiring Soon" completed',
    author: "Emily Brown",
    timeAgo: "4 hours ago",
  },
];

export default function RecentActivitySection({
  activities = OVERVIEW_ACTIVITIES,
  showIcons = true,
}) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Recent Activity
        </h3>
      </div>

      {/* Activity List */}
      {showIcons ? (
        <div className="relative pl-1">
          {/* Connecting vertical line */}
          <div className="absolute left-[15px] top-3 bottom-3 w-[1px] bg-light-gray/80" />

          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 relative z-10"
                >
                  <div
                    className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${activity.iconColor || "text-emerald-600 bg-emerald-50 border-emerald-100"}`}
                  >
                    {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex flex-col min-w-0 pt-0.5">
                    <span className="font-medium text-dark-black/80 text-xs">
                      {activity.title}
                    </span>
                    <span className="text-[11px] text-light-black font-normal mt-0.5">
                      {activity.author} • {activity.timeAgo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex flex-col">
              <span className="font-medium text-dark-black/80 text-xs leading-tight">
                {activity.title}
              </span>
              <span className="text-[11px] text-light-black font-normal mt-0.5">
                {activity.author} • {activity.timeAgo}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

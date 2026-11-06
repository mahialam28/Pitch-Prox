"use client";

import React from "react";
import { Activity } from "lucide-react";

const ago = (value) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value)) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} h ago`;
  return `${Math.floor(minutes / 1440)} d ago`;
};
// audit entries from GET /api/v1/campaigns/overview → the list's shape
export const toActivities = (entries = []) => entries.map((entry) => ({ id: entry.id, title: entry.summary, author: entry.actor ?? "System", timeAgo: ago(entry.createdAt), icon: Activity }));

export default function RecentActivitySection({ activities = [], showIcons = true }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Recent Activity
        </h3>
      </div>

      {!activities.length && <p className="text-xs text-light-black">No campaign activity yet.</p>}
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

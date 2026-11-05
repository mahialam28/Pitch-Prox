"use client";

import React from "react";

const timeLabel = (value) =>
  new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

// changes: audit entries from /api/v1/admin/access-changes
export default function RecentAccessChanges({ changes = [] }) {
  const items = changes.map((item) => ({ id: item.id, title: item.summary, user: item.actorName, time: timeLabel(item.createdAt) }));

  return (
    <div className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <h3 className="text-sm font-bold text-dark-black/90 font-secondary">
        Recent Access Changes
      </h3>

      {/* List items */}
      <div className="divide-y divide-light-gray/60 flex flex-col">
        {!items.length && <p className="text-xs text-light-black">No access changes yet.</p>}
        {items.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-dark-black/90">
              {item.title}
            </span>
            <div className="flex items-center justify-between text-[11px] text-light-black">
              <span className="text-medium-black font-medium">{item.user}</span>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

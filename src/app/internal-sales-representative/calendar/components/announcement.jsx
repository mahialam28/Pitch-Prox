"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Volume2, X, Plus, Archive, RotateCcw, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest, formatDate, formatDateTime } from "@/lib/client-api";
import AddAnnouncementModal from "@/app/super-admin/calendar-announcements/components/add-announcement-modal";
import { ANNOUNCEMENTS_CHANGED } from "./use-calendar-counts";

// Live announcements (lib/announcements), shared by the Sales Rep and Super Admin calendars.
// Everyone sees what's meant for their role and can dismiss it; Super Admin, Admin Manager
// and Support also post, schedule, edit and archive.

const LEVEL = {
  urgent: { level: "URGENT", levelBg: "bg-red/10 text-red border border-red/20", iconBg: "bg-red/10 text-red", liveBg: "bg-red/10 text-red" },
  important: { level: "IMPORTANT", levelBg: "bg-amber-50 text-amber-600 border border-amber-100", iconBg: "bg-amber-50 text-amber-600", liveBg: "bg-amber-50 text-amber-600" },
  normal: { level: "NORMAL", levelBg: "bg-blue-50 text-blue-600 border border-blue-100", iconBg: "bg-blue-50 text-blue-600", liveBg: "bg-emerald-50 text-emerald-600" },
  low: { level: "LOW", levelBg: "bg-light-gray text-medium-black border border-light-gray", iconBg: "bg-light-gray text-medium-black", liveBg: "bg-light-gray text-medium-black" },
};
const SCHEDULED = { level: "SCHEDULED", levelBg: "bg-purple-50 text-purple-600 border border-purple-100", iconBg: "bg-purple-50 text-purple-600", liveBg: "bg-purple-50 text-purple-600" };
const ARCHIVED = { level: "ARCHIVED", levelBg: "bg-light-gray text-medium-black border border-light-gray", iconBg: "bg-light-gray text-medium-black", liveBg: "bg-light-gray text-medium-black" };

const changed = () => window.dispatchEvent(new Event(ANNOUNCEMENTS_CHANGED));

export default function Announcement() {
  const [activeTab, setActiveTab] = useState("active");
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | announcement

  const load = useCallback(
    () => apiRequest(`/api/v1/announcements?tab=${activeTab}`).then(setData).catch((error) => toast.error(error.message)),
    [activeTab]
  );
  useEffect(() => {
    load();
  }, [load]);

  const act = async (request, message) => {
    try {
      await request;
      if (message) toast.success(message);
      load();
      changed();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const dismiss = (item) => act(apiRequest(`/api/v1/announcements/${item.id}/dismiss`, { method: "POST" }), "Announcement dismissed");
  const archive = (item, archived) => act(apiRequest(`/api/v1/announcements/${item.id}`, { method: "PATCH", body: { archived } }), archived ? "Announcement archived" : "Announcement restored");
  const remove = (item) => {
    if (!window.confirm(`Delete the scheduled announcement "${item.title}"?`)) return;
    act(apiRequest(`/api/v1/announcements/${item.id}`, { method: "DELETE" }), "Announcement deleted");
  };
  const save = async (body) => {
    if (editing && editing !== "new") await apiRequest(`/api/v1/announcements/${editing.id}`, { method: "PATCH", body });
    else await apiRequest("/api/v1/announcements", { method: "POST", body });
    load();
    changed();
  };

  const canManage = data?.canManage;
  const tabs = [
    { id: "active", label: "Active" },
    ...(canManage ? [{ id: "scheduled", label: "Scheduled" }] : []),
    { id: "archived", label: "Archived" },
  ];
  const displayedList = (data?.results ?? []).map((item) => ({
    ...item,
    ...(activeTab === "scheduled" ? SCHEDULED : activeTab === "archived" ? ARCHIVED : LEVEL[item.priority] ?? LEVEL.normal),
    date: activeTab === "scheduled" ? `Publishes ${formatDateTime(item.publishAt)}` : formatDate(item.publishAt),
  }));

  return (
    <>
      <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm flex flex-col h-full w-full min-w-0">
        <div className="space-y-3 pb-3 border-b border-light-gray shrink-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-dark-black font-secondary">Announcements</h2>
            {canManage && (
              <button
                type="button"
                onClick={() => setEditing("new")}
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 relative transition-colors cursor-pointer ${isActive ? "text-primary font-bold" : "text-light-black hover:text-dark-black"}`}
                >
                  <span>{tab.label}</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[520px] pt-3.5 pr-1 space-y-3.5">
          {displayedList.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl border border-light-gray/80 hover:border-primary/40 bg-white hover:shadow-xs transition-all flex items-start gap-3.5 group">
              <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}>
                <Volume2 className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${item.levelBg}`}>{item.level}</span>
                  <div className="flex items-center gap-1">
                    {item.canEdit && activeTab !== "archived" && (
                      <button type="button" onClick={() => setEditing(item)} className="text-light-black hover:text-dark-black p-0.5 rounded transition-colors cursor-pointer" title="Edit announcement" aria-label={`Edit ${item.title}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {item.canEdit && activeTab === "active" && (
                      <button type="button" onClick={() => archive(item, true)} className="text-light-black hover:text-dark-black p-0.5 rounded transition-colors cursor-pointer" title="Archive for everyone" aria-label={`Archive ${item.title}`}>
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {item.canEdit && activeTab === "scheduled" && (
                      <button type="button" onClick={() => remove(item)} className="text-light-black hover:text-red p-0.5 rounded transition-colors cursor-pointer" title="Delete scheduled announcement" aria-label={`Delete ${item.title}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {item.canEdit && activeTab === "archived" && item.archivedAt && (
                      <button type="button" onClick={() => archive(item, false)} className="text-light-black hover:text-dark-black p-0.5 rounded transition-colors cursor-pointer" title="Restore" aria-label={`Restore ${item.title}`}>
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {activeTab === "active" && (
                      <button type="button" onClick={() => dismiss(item)} className="text-light-black hover:text-dark-black p-0.5 rounded transition-colors cursor-pointer" title="Dismiss from my list" aria-label={`Dismiss ${item.title}`}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-dark-black leading-snug font-secondary">{item.title}</h3>
                <p className="text-[11px] sm:text-xs text-medium-black leading-relaxed whitespace-pre-line">{item.body}</p>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-light-black truncate">
                    <span className="font-semibold text-medium-black">{item.audience}</span> · {item.authorName} · {item.date}
                    {item.expiresAt && activeTab !== "archived" ? ` · until ${formatDate(item.expiresAt)}` : ""}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${item.liveBg}`}>
                    {activeTab === "active" ? "Live" : activeTab === "scheduled" ? "Scheduled" : "Ended"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {data && displayedList.length === 0 && <div className="py-8 text-center text-xs text-light-black">No announcements in this view.</div>}
          {!data && <div className="py-8 text-center text-xs text-light-black">Loading…</div>}
        </div>
      </div>

      {editing && <AddAnnouncementModal isOpen announcement={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
    </>
  );
}

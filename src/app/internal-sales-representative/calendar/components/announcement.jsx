"use client";

import React, { useState } from "react";
import { Volume2, X } from "lucide-react";
import toast from "react-hot-toast";

const initialActiveAnnouncements = [
  {
    id: "1",
    level: "URGENT",
    levelBg: "bg-red/10 text-red border border-red/20",
    iconBg: "bg-red/10 text-red",
    liveBg: "bg-red/10 text-red",
    title: "System Maintenance – May 24",
    body: "The system will be undergoing maintenance on May 24 from 2:00 AM – 6:00 AM EST.",
    audience: "All Employees",
    author: "Daniel Miller",
    date: "May 18, 2024",
  },
  {
    id: "2",
    level: "IMPORTANT",
    levelBg: "bg-amber-50 text-amber-600 border border-amber-100",
    iconBg: "bg-amber-50 text-amber-600",
    liveBg: "bg-amber-50 text-amber-600",
    title: "Q2 Planning Sessions",
    body: "Q2 department planning sessions will take place during the week of May 27 – May 31.",
    audience: "Managers",
    author: "Sarah Johnson",
    date: "May 16, 2024",
  },
  {
    id: "3",
    level: "NORMAL",
    levelBg: "bg-blue-50 text-blue-600 border border-blue-100",
    iconBg: "bg-blue-50 text-blue-600",
    liveBg: "bg-emerald-50 text-emerald-600",
    hasDot: true,
    title: "Support Team Update",
    body: "New escalation workflow is now live. Please review the updated process.",
    audience: "Support Team",
    author: "Jennifer Lee",
    date: "May 14, 2024",
  },
  {
    id: "4-active",
    level: "IMPORTANT",
    levelBg: "bg-amber-50 text-amber-600 border border-amber-100",
    iconBg: "bg-amber-50 text-amber-600",
    liveBg: "bg-amber-50 text-amber-600",
    title: "New Product Release Webinar",
    body: "Join the product team on Friday for a comprehensive walkthrough of the upcoming features.",
    audience: "All Sales Reps",
    author: "Product Team",
    date: "May 12, 2024",
  },
];

const scheduledAnnouncements = [
  {
    id: "4",
    level: "SCHEDULED",
    levelBg: "bg-purple-50 text-purple-600 border border-purple-100",
    iconBg: "bg-purple-50 text-purple-600",
    liveBg: "bg-purple-50 text-purple-600",
    title: "Q3 Sales Goal Kickoff",
    body: "Live company webinar to align on new performance milestones.",
    audience: "Sales & Marketing",
    author: "Alex Turner",
    date: "June 1, 2024",
  },
];

const archivedAnnouncements = [
  {
    id: "5",
    level: "ARCHIVED",
    levelBg: "bg-light-gray text-medium-black border border-light-gray",
    iconBg: "bg-light-gray text-medium-black",
    liveBg: "bg-light-gray text-medium-black",
    title: "Security Certificate Renewal Completed",
    body: "Annual SSL certificate migration was successfully finalized with zero downtime.",
    audience: "All Employees",
    author: "IT Operations",
    date: "May 10, 2024",
  },
  {
    id: "6",
    level: "ARCHIVED",
    levelBg: "bg-light-gray text-medium-black border border-light-gray",
    iconBg: "bg-light-gray text-medium-black",
    liveBg: "bg-light-gray text-medium-black",
    title: "Q1 Performance Review Wrap-up",
    body: "All manager evaluations and compensation adjustments have been recorded in HR portal.",
    audience: "Managers & Leads",
    author: "Human Resources",
    date: "May 04, 2024",
  },
  {
    id: "7",
    level: "ARCHIVED",
    levelBg: "bg-light-gray text-medium-black border border-light-gray",
    iconBg: "bg-light-gray text-medium-black",
    liveBg: "bg-light-gray text-medium-black",
    title: "Office Network Firmware Upgrade",
    body: "WiFi 6 router infrastructure update completed over the weekend.",
    audience: "HQ Staff",
    author: "Network Ops",
    date: "April 28, 2024",
  },
  {
    id: "8",
    level: "ARCHIVED",
    levelBg: "bg-light-gray text-medium-black border border-light-gray",
    iconBg: "bg-light-gray text-medium-black",
    liveBg: "bg-light-gray text-medium-black",
    title: "New VoIP Telephone Provider Setup",
    body: "Customer outbound caller routing configured with updated latency thresholds.",
    audience: "Sales & Support",
    author: "Telecom Team",
    date: "April 15, 2024",
  },
];

export default function Announcement() {
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'scheduled' | 'archived'
  const [announcements, setAnnouncements] = useState(initialActiveAnnouncements);

  const handleDismiss = (id) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    toast.success("Announcement dismissed");
  };

  const displayedList =
    activeTab === "active"
      ? announcements
      : activeTab === "scheduled"
        ? scheduledAnnouncements
        : archivedAnnouncements;

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm flex flex-col h-full w-full min-w-0">
      {/* ── Top Header & Tab Navigation ── */}
      <div className="space-y-3 pb-3 border-b border-light-gray shrink-0">
        <h2 className="text-lg sm:text-xl font-bold text-dark-black">
          Announcements
        </h2>

        {/* Tabs */}
        <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold">
          {[
            { id: "active", label: "Active" },
            { id: "scheduled", label: "Scheduled" },
            { id: "archived", label: "Archived" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 relative transition-colors cursor-pointer ${isActive
                  ? "text-primary font-bold"
                  : "text-light-black hover:text-dark-black"
                  }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable Announcement Cards List ── */}
      <div className="flex-1 overflow-y-auto max-h-[520px] pt-3.5 pr-1 space-y-3.5">
        {displayedList.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-light-gray/80 hover:border-primary/40 bg-white hover:shadow-xs transition-all flex items-start gap-3.5 group"
          >
            {/* Speaker Icon Box */}
            <div
              className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}
            >
              <Volume2 className="w-4 h-4" />
            </div>

            {/* Content Box */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Level Badge + Dismiss Action */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${item.levelBg}`}
                >
                  {item.level}
                </span>

                {item.hasDot ? (
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDismiss(item.id)}
                    className="text-light-black hover:text-dark-black p-0.5 rounded transition-colors cursor-pointer"
                    title="Dismiss announcement"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xs sm:text-sm font-bold text-dark-black leading-snug">
                {item.title}
              </h3>

              {/* Body Text */}
              <p className="text-[11px] sm:text-xs text-medium-black leading-relaxed">
                {item.body}
              </p>

              {/* Footer Meta Row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-light-black truncate">
                  <span className="font-semibold text-medium-black">
                    {item.audience}
                  </span>{" "}
                  · {item.author} {item.date}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${item.liveBg}`}
                >
                  Live
                </span>
              </div>
            </div>
          </div>
        ))}

        {displayedList.length === 0 && (
          <div className="py-8 text-center text-xs text-light-black">
            No announcements in this view.
          </div>
        )}
      </div>
    </div>
  );
}

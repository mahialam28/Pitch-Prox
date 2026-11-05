"use client";

import React from "react";
import CalendarHeader from "./components/calendar-header";
import InternalCalendar from "./components/internal-calendar";
import Announcement from "./components/announcement";

export default function CalendarPage() {
  return (
    <div className="w-full flex flex-col gap-6 min-w-0">
      {/* ── Top Metric Header ── */}
      <CalendarHeader />

      {/* ── Main 2-Column Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full min-w-0">
        {/* Left: Internal Calendar (8 cols on XL, 7 cols on LG) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-w-0">
          <InternalCalendar />
        </div>

        {/* Right: Announcements (4 cols on XL, 5 cols on LG) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-w-0">
          <Announcement />
        </div>
      </div>
    </div>
  );
}

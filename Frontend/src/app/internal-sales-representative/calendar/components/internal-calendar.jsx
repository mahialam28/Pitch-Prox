"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { CALENDAR_CHANGED } from "./use-calendar-counts";
import AddEventModal from "./add-event-modal";
import EventDetailsModal from "./event-details-modal";
import DayEventsModal from "./day-events-modal";

const eventTypeFilters = [
  { value: "all", label: "All Event Types" },
  { value: "company-meeting", label: "Company Meeting" },
  { value: "product", label: "Product" },
  { value: "billing", label: "Billing" },
  { value: "support", label: "Support" },
  { value: "sales", label: "Sales" },
  { value: "training", label: "Training" },
  { value: "compliance", label: "Compliance" },
  { value: "other", label: "Other" },
];

const departmentFilters = [
  { value: "all", label: "All Departments" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "product", label: "Product & Eng" },
  { value: "billing", label: "Billing" },
  { value: "management", label: "Management" },
];

const visibilityFilters = [
  { value: "all", label: "All Visibility" },
  { value: "public", label: "All Employees" },
  { value: "internal", label: "Internal Only" },
  { value: "management", label: "Management Only" },
  { value: "private", label: "Private" },
];

const legendCategories = [
  { label: "COMPANY MEETING", color: "bg-purple-500" },
  { label: "PRODUCT", color: "bg-teal-500" },
  { label: "BILLING", color: "bg-orange-500" },
  { label: "SUPPORT", color: "bg-blue-500" },
  { label: "SALES", color: "bg-red" },
  { label: "TRAINING", color: "bg-emerald-500" },
  { label: "COMPLIANCE", color: "bg-indigo-500" },
  { label: "OTHER", color: "bg-gray-400" },
];

// ── Dates are handled as local "YYYY-MM-DD" keys so nothing shifts with time zones ──
const pad = (value) => String(value).padStart(2, "0");
const keyOf = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const addDays = (key, days) => {
  const date = parseKey(key);
  date.setDate(date.getDate() + days);
  return keyOf(date);
};
const addMonths = (key, months) => {
  const date = parseKey(key);
  return keyOf(new Date(date.getFullYear(), date.getMonth() + months, 1));
};
const monthStart = (key) => `${key.slice(0, 7)}-01`;
const monthEnd = (key) => {
  const date = parseKey(key);
  return keyOf(new Date(date.getFullYear(), date.getMonth() + 1, 0));
};
const weekStart = (key) => addDays(key, -parseKey(key).getDay()); // Sunday
const format = (key, options) => parseKey(key).toLocaleDateString("en-US", options);
const to12h = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${pad(hours % 12 || 12)}:${pad(minutes)} ${hours < 12 ? "AM" : "PM"}`;
};

const TYPE_STYLES = {
  "Company Meeting": { dot: "bg-purple-500", pill: "bg-purple-50 text-purple-700 border border-purple-100", week: "border-l-4 border-purple-500 bg-purple-50 text-purple-700", tag: "bg-purple-100 text-purple-700" },
  Product: { dot: "bg-teal-500", pill: "bg-teal-50 text-teal-700 border border-teal-100", week: "border-l-4 border-teal-500 bg-teal-50 text-teal-700", tag: "bg-teal-100 text-teal-700" },
  Billing: { dot: "bg-orange-500", pill: "bg-orange-50 text-orange-700 border border-orange-100", week: "border-l-4 border-orange-500 bg-orange-50 text-orange-700", tag: "bg-orange-100 text-orange-700" },
  Support: { dot: "bg-blue-500", pill: "bg-blue-50 text-blue-700 border border-blue-100", week: "border-l-4 border-blue-500 bg-blue-50 text-blue-700", tag: "bg-blue-100 text-blue-700" },
  Sales: { dot: "bg-red", pill: "bg-red/10 text-red border border-red/20", week: "border-l-4 border-red bg-red/10 text-red", tag: "bg-red/10 text-red" },
  Training: { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 border border-emerald-100", week: "border-l-4 border-emerald-500 bg-emerald-50 text-emerald-700", tag: "bg-emerald-100 text-emerald-700" },
  Compliance: { dot: "bg-indigo-500", pill: "bg-indigo-50 text-indigo-700 border border-indigo-100", week: "border-l-4 border-indigo-500 bg-indigo-50 text-indigo-700", tag: "bg-indigo-100 text-indigo-700" },
  Other: { dot: "bg-gray-400", pill: "bg-light-gray text-medium-black border border-light-gray", week: "border-l-4 border-gray-400 bg-gray-50 text-gray-700", tag: "bg-light-gray text-medium-black" },
};

// API event → the shape the views and modals use
const toViewEvent = (event) => {
  const [startDate, startClock] = event.startsAt.split("T");
  const [endDate, endClock] = event.endsAt.split("T");
  const style = TYPE_STYLES[event.eventType] ?? TYPE_STYLES.Other;
  const minutes = Math.round((new Date(event.endsAt) - new Date(event.startsAt)) / 60000);
  return {
    ...event,
    dateKey: startDate,
    startDate,
    endDate,
    startTime: to12h(startClock),
    endTime: to12h(endClock),
    time: to12h(startClock),
    clock: startClock,
    endClock,
    startHour: Number(startClock.slice(0, 2)),
    duration: minutes >= 60 * 24 ? `${Math.round(minutes / 1440)} days` : `${minutes} mins`,
    type: event.eventType.toLowerCase().replace(/\s+/g, "-"),
    departmentTag: (event.department || "All Departments").toUpperCase(),
    dotColor: style.dot,
    pillBg: style.pill,
    weekBorder: style.week,
    deptTagBg: style.tag,
  };
};

const VISIBILITY_KEYS = { "All Employees": "public", "Internal Only": "internal", "Management Only": "management", Private: "private" };
const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const eventPayload = (event) => ({
  title: event.title,
  description: event.description,
  eventType: event.eventType,
  department: event.department,
  visibility: event.visibility,
  locationLink: event.locationLink,
  startDate: event.startDate,
  startTime: event.startTime,
  endDate: event.endDate || event.startDate,
  endTime: event.endTime,
});

export default function InternalCalendar() {
  const [now] = useState(() => new Date());
  const today = keyOf(now);
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week' | 'day' | 'list'
  const [selectedDay, setSelectedDay] = useState(today); // anchor date for every view
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedVis, setSelectedVis] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDate, setAddDate] = useState(today);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [dayModalData, setDayModalData] = useState({ day: today, events: [] });

  // Fetch the anchor month plus a week either side (covers the month grid and week view)
  const month = selectedDay.slice(0, 7);
  const load = useCallback(async () => {
    const from = addDays(`${month}-01`, -7);
    const to = addDays(monthEnd(`${month}-01`), 7);
    try {
      const { results } = await apiRequest(`/api/v1/calendar/events?from=${from}&to=${to}`);
      setEvents(results.map(toViewEvent));
      window.dispatchEvent(new Event(CALENDAR_CHANGED));
    } catch (error) {
      showError("Calendar not loaded", error.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const openAdd = (dateKey = selectedDay) => {
    setAddDate(dateKey);
    setIsAddModalOpen(true);
  };

  // Modals await these; a thrown error keeps the modal open and shows the message
  const handleAddEvent = async (newEvent) => {
    await apiRequest("/api/v1/calendar/events", { method: "POST", body: eventPayload(newEvent) });
    setSelectedDay(newEvent.startDate);
    load();
  };

  const handleDeleteEvent = async (id) => {
    await apiRequest(`/api/v1/calendar/events/${id}`, { method: "DELETE" });
    load();
  };

  const handleUpdateEvent = async (updatedEvent) => {
    const { event } = await apiRequest(`/api/v1/calendar/events/${updatedEvent.id}`, { method: "PUT", body: eventPayload(updatedEvent) });
    setSelectedEvent(toViewEvent(event));
    load();
  };

  const handleOpenDetails = (e, evt) => {
    e?.stopPropagation?.();
    setSelectedEvent(evt);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDayEvents = (e, day, dayEvents) => {
    e?.stopPropagation?.();
    setDayModalData({ day, events: dayEvents });
    setIsDayEventsModalOpen(true);
  };

  // Previous / next step by the current view
  const shift = (direction) => {
    if (viewMode === "week") setSelectedDay(addDays(selectedDay, 7 * direction));
    else if (viewMode === "day") setSelectedDay(addDays(selectedDay, direction));
    else setSelectedDay(addMonths(selectedDay, direction));
  };

  const weekFirst = weekStart(selectedDay);
  const weekLast = addDays(weekFirst, 6);
  const currentMonth =
    viewMode === "week"
      ? `${format(weekFirst, { month: "short", day: "numeric" })} – ${weekFirst.slice(5, 7) === weekLast.slice(5, 7) ? parseKey(weekLast).getDate() : format(weekLast, { month: "short", day: "numeric" })}, ${weekLast.slice(0, 4)}`
      : viewMode === "day"
        ? format(selectedDay, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
        : format(selectedDay, { month: "long", year: "numeric" });

  // Filter events
  const filteredEvents = events.filter((evt) => {
    if (selectedType !== "all" && evt.type !== selectedType) return false;
    if (selectedDept !== "all" && (evt.department || "All Departments").toLowerCase().split(" ")[0] !== selectedDept) return false;
    if (selectedVis !== "all" && VISIBILITY_KEYS[evt.visibility] !== selectedVis) return false;
    return true;
  });
  const eventsOn = (dateKey) => filteredEvents.filter((evt) => evt.dateKey === dateKey);

  // Month view: weekday (Mon–Fri) rows covering the month
  const calendarGrid = [];
  for (let rowStart = addDays(weekStart(monthStart(selectedDay)), 1); rowStart <= monthEnd(selectedDay); rowStart = addDays(rowStart, 7)) {
    const row = Array.from({ length: 5 }, (_, index) => {
      const key = addDays(rowStart, index);
      return { key, day: parseKey(key).getDate(), isPrev: key.slice(0, 7) !== month };
    });
    if (row.some((cell) => !cell.isPrev)) calendarGrid.push(row);
  }
  // Weekend events in the month (the grid shows weekdays only)
  const weekendCount = filteredEvents.filter((evt) => evt.dateKey.slice(0, 7) === month && [0, 6].includes(parseKey(evt.dateKey).getDay())).length;

  // Week view: Sunday → Saturday
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const key = addDays(weekFirst, index);
    return { key, day: parseKey(key).getDate(), name: WEEKDAY_NAMES[index], isToday: key === today };
  });

  // Hour rows: 08:00–18:00, stretched to fit early or late events
  const visibleHours = (viewMode === "day" ? eventsOn(selectedDay) : filteredEvents.filter((evt) => evt.dateKey >= weekFirst && evt.dateKey <= weekLast)).map((evt) => evt.startHour);
  const firstHour = Math.min(8, ...visibleHours);
  const lastHour = Math.max(18, ...visibleHours);
  const hoursList = Array.from({ length: lastHour - firstHour + 1 }, (_, index) => `${pad(firstHour + index)}:00`);
  const nowHour = now.getHours();
  const nowOffset = Math.round((now.getMinutes() / 60) * 100);

  // List view: the anchor month grouped by date
  const listGroups = [...new Set(filteredEvents.filter((evt) => evt.dateKey.slice(0, 7) === month).map((evt) => evt.dateKey))].map((key) => ({
    key,
    day: parseKey(key).getDate(),
    dayShort: format(key, { weekday: "short" }).toUpperCase(),
    dateHeading: format(key, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    events: eventsOn(key),
  }));

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm flex flex-col gap-5 w-full min-w-0">
      {/* ── Top Header Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-dark-black">
          Internal Calendar
        </h2>

        {/* View Switcher, Date Nav, and Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Switcher Pills */}
          <div className="flex items-center bg-light-gray p-1 rounded-xl border border-light-gray">
            {["month", "week", "day", "list"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${viewMode === mode
                    ? "bg-primary text-white shadow-xs"
                    : "text-medium-black hover:text-dark-black"
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-1.5 bg-white border border-light-gray px-2 py-1 rounded-xl">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => shift(-1)}
              className="p-1 hover:bg-light-gray rounded-lg transition-colors cursor-pointer text-light-black hover:text-dark-black"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-dark-black px-1.5 whitespace-nowrap">
              {currentMonth}
            </span>
            <button
              type="button"
              aria-label="Next"
              onClick={() => shift(1)}
              className="p-1 hover:bg-light-gray rounded-lg transition-colors cursor-pointer text-light-black hover:text-dark-black"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={() => setSelectedDay(today)}
            className="px-3 py-1.5 text-xs font-semibold text-medium-black bg-white border border-light-gray hover:bg-light-gray rounded-xl transition-colors cursor-pointer"
          >
            Today
          </button>

          {/* + Add Event Button */}
          <button
            type="button"
            onClick={() => openAdd()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-medium-teal rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-44 shrink-0">
          <Dropdown
            label="All Event Types"
            items={eventTypeFilters}
            selected={selectedType}
            onSelect={setSelectedType}
            className="w-full"
          />
        </div>

        <div className="w-44 shrink-0">
          <Dropdown
            label="All Departments"
            items={departmentFilters}
            selected={selectedDept}
            onSelect={setSelectedDept}
            className="w-full"
          />
        </div>

        <div className="w-44 shrink-0">
          <Dropdown
            label="All Visibility"
            items={visibilityFilters}
            selected={selectedVis}
            onSelect={setSelectedVis}
            className="w-full"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 1. MONTH VIEW ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "month" && (
        <div className="w-full border border-light-gray rounded-2xl overflow-hidden min-w-0">
          {/* Weekday Headers (5 Columns: MON - FRI) */}
          <div className="grid grid-cols-5 bg-light-gray/40 border-b border-light-gray text-center text-[11px] font-bold text-light-black py-2.5">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
          </div>

          {/* Days Matrix */}
          <div className="divide-y divide-light-gray bg-white">
            {calendarGrid.map((row) => (
              <div key={row[0].key} className="grid grid-cols-5 divide-x divide-light-gray min-h-[92px] sm:min-h-[105px]">
                {row.map((cell) => {
                  const dayEvents = cell.isPrev ? [] : eventsOn(cell.key);
                  const isSelected = selectedDay === cell.key;
                  const visibleEvents = dayEvents.slice(0, 1);
                  const extraCount = dayEvents.length - 1;

                  return (
                    <div
                      key={cell.key}
                      onClick={() => {
                        if (!cell.isPrev) {
                          setSelectedDay(cell.key);
                          if (dayEvents.length > 1) {
                            setDayModalData({ day: cell.key, events: dayEvents });
                            setIsDayEventsModalOpen(true);
                          }
                        }
                      }}
                      className={`p-2 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer ${cell.isPrev
                          ? "bg-light-gray/20 text-light-black/40"
                          : isSelected
                            ? "bg-primary/5 ring-2 ring-inset ring-primary/80"
                            : "hover:bg-primary/5 text-dark-black"
                        }`}
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold ${cell.isPrev ? "text-light-black/40" : cell.key === today ? "w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center" : "text-dark-black"
                            }`}
                        >
                          {cell.day}
                        </span>
                      </div>

                      {/* Events inside this Day */}
                      <div className="space-y-1 mt-1">
                        {visibleEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => handleOpenDetails(e, evt)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold leading-tight truncate shadow-xs hover:scale-[1.02] hover:shadow-sm transition-all cursor-pointer ${evt.pillBg}`}
                            title="Click to view event details"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${evt.dotColor}`} />
                            <span className="truncate">{evt.time} {evt.title}</span>
                          </div>
                        ))}

                        {extraCount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenDayEvents(e, cell.key, dayEvents)}
                            className="text-[10px] font-bold text-primary hover:text-medium-teal hover:underline block pl-1 text-left cursor-pointer"
                          >
                            +{extraCount} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {weekendCount > 0 && (
            <p className="px-3 py-2 text-[11px] text-medium-black border-t border-light-gray bg-light-gray/20">
              {weekendCount} weekend event{weekendCount === 1 ? "" : "s"} this month — switch to Week or List view to see {weekendCount === 1 ? "it" : "them"}.
            </p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 2. WEEK VIEW (Exact Layout Matching Image 1) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "week" && (
        <div className="w-full border border-light-gray rounded-2xl overflow-x-auto min-w-0 bg-white">
          <div className="min-w-[680px]">
            {/* Week Days Header Row */}
            <div className="grid grid-cols-8 border-b border-light-gray bg-light-gray/20">
              {/* Top Left Gutter */}
              <div className="p-3 border-r border-light-gray" />

              {/* 7 Days (SUN 19 to SAT 25) */}
              {weekDays.map((wd) => (
                <div
                  key={wd.key}
                  onClick={() => setSelectedDay(wd.key)}
                  className={`p-3 cursor-pointer flex flex-col items-center justify-center border-r last:border-r-0 border-light-gray text-center ${wd.isToday ? "bg-primary/5" : ""
                    }`}
                >
                  <span className="text-[11px] font-bold text-light-black uppercase">
                    {wd.name}
                  </span>
                  {wd.isToday ? (
                    <div className="w-8 h-8 rounded-full bg-[#0e5a59] text-white flex items-center justify-center font-bold text-sm shadow-xs mt-0.5">
                      {wd.day}
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-dark-black mt-1">
                      {wd.day}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Hourly Grid Rows */}
            <div className="divide-y divide-light-gray">
              {hoursList.map((hourStr) => {
                const hourNum = parseInt(hourStr.split(":")[0], 10);
                return (
                  <div key={hourStr} className="grid grid-cols-8 min-h-[54px]">
                    {/* Time Label Gutter */}
                    <div className="p-2 border-r border-light-gray text-[11px] font-semibold text-light-black flex items-start justify-center">
                      {hourStr}
                    </div>

                    {/* 7 Day Columns */}
                    {weekDays.map((wd) => {
                      const slotEvents = eventsOn(wd.key).filter((e) => e.startHour === hourNum);

                      return (
                        <div
                          key={wd.key}
                          className="border-r last:border-r-0 border-light-gray p-1 relative flex flex-col gap-1"
                        >
                          {slotEvents.map((evt) => (
                            <div
                              key={evt.id}
                              onClick={(e) => handleOpenDetails(e, evt)}
                              className={`p-1.5 rounded-r-xl text-[10px] leading-snug cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${evt.weekBorder || "border-l-4 border-primary bg-primary/10 text-primary"}`}
                            >
                              <p className="font-bold truncate">
                                {evt.clock} - {evt.title}
                              </p>
                              <p className="text-[9px] opacity-80 truncate">
                                {evt.department || "All Departments"}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 3. DAY VIEW (Exact Layout Matching Image 2) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "day" && (
        <div className="w-full border border-light-gray rounded-2xl overflow-hidden bg-white min-w-0">
          <div className="divide-y divide-light-gray relative">
            {hoursList.map((hourStr) => {
              const hourNum = Number(hourStr.slice(0, 2));
              const slotEvents = eventsOn(selectedDay).filter((evt) => evt.startHour === hourNum);
              return (
                <div key={hourStr} className="flex min-h-[58px] relative">
                  {selectedDay === today && hourNum === nowHour && (
                    <div className="absolute left-16 sm:left-20 right-4 z-10 flex items-center pointer-events-none" style={{ top: `${nowOffset}%` }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-red shadow-xs -ml-1.5 shrink-0" />
                      <div className="h-0.5 w-full bg-red/80" />
                    </div>
                  )}
                  <div className="w-16 sm:w-20 p-3 border-r border-light-gray text-[11px] font-semibold text-light-black/80 flex items-start justify-center shrink-0">
                    {hourStr}
                  </div>
                  <div className="flex-1 p-2 flex flex-col gap-2">
                    {slotEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => handleOpenDetails(e, evt)}
                        className={`w-full p-3 rounded-r-2xl transition-all cursor-pointer shadow-2xs hover:brightness-95 ${evt.weekBorder}`}
                      >
                        <h4 className="text-xs sm:text-sm font-bold">{evt.title}</h4>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          {evt.clock} - {evt.endClock} • {evt.department || "All Departments"}
                          {evt.source === "follow-up" ? " • Lead follow-up" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {!loading && !eventsOn(selectedDay).length && (
              <p className="p-4 text-center text-xs text-medium-black">
                Nothing scheduled on {format(selectedDay, { weekday: "long", month: "long", day: "numeric" })}.{" "}
                <button type="button" onClick={() => openAdd(selectedDay)} className="font-semibold text-primary hover:underline cursor-pointer">
                  Add an event
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 4. LIST VIEW (Exact Layout Matching Image 3) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {viewMode === "list" && (
        <div className="space-y-6 w-full min-w-0">
          {!loading && !listGroups.length && (
            <p className="py-10 text-center text-sm text-medium-black border border-dashed border-light-gray rounded-2xl">
              No events in {format(selectedDay, { month: "long", year: "numeric" })}.
            </p>
          )}
          {listGroups.map((group) => (
            <div key={group.key} className="space-y-3">
              {/* Group Date Header with Badge */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                  <span className="text-[9px] font-bold tracking-wider uppercase leading-none">
                    {group.dayShort}
                  </span>
                  <span className="text-base font-extrabold leading-none mt-0.5">
                    {group.day}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-dark-black">
                  {group.dateHeading}
                </h3>
              </div>

              {/* Event Cards Stack */}
              <div className="space-y-2.5 pl-1 sm:pl-2">
                {group.events.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={(e) => handleOpenDetails(e, evt)}
                    className="p-4 bg-white rounded-2xl border border-light-gray hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      {/* Left Time Box */}
                      <div className="flex flex-col shrink-0 min-w-[72px]">
                        <span className="text-xs font-bold text-teal-800">
                          {evt.time}
                        </span>
                        <span className="text-[10px] text-light-black font-medium">
                          {evt.duration || "60 mins"}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="h-8 w-px bg-light-gray shrink-0" />

                      {/* Department Tag & Title */}
                      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${evt.deptTagBg || "bg-indigo-50 text-indigo-600"
                            }`}
                        >
                          {evt.departmentTag || evt.department || "SALES DEPT"}
                        </span>

                        <h4 className="text-xs sm:text-sm font-semibold text-dark-black/75 truncate">
                          {evt.title}
                        </h4>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-light-black shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Category Legend Row ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-[10px] sm:text-[11px] font-bold text-light-black">
        {legendCategories.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        key={addDate}
        defaultDate={addDate}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />

      {/* Day Events Multi-View Modal (opened when clicking +X more) */}
      <DayEventsModal
        isOpen={isDayEventsModalOpen}
        onClose={() => setIsDayEventsModalOpen(false)}
        day={dayModalData.day}
        events={dayModalData.events}
        onSelectEvent={(evt) => {
          setIsDayEventsModalOpen(false);
          setSelectedEvent(evt);
          setIsDetailsModalOpen(true);
        }}
        onAddEventForDay={(d) => {
          setSelectedDay(d);
          openAdd(d);
        }}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
        onDeleteEvent={handleDeleteEvent}
        onUpdateEvent={handleUpdateEvent}
      />
    </div>
  );
}

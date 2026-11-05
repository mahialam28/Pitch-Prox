"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Link2,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronUp,
  ChevronDown,
  Pencil,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM",
];

const TIME_PRESETS = [
  { label: "Morning", time: "09:00 AM" },
  { label: "Noon", time: "12:00 PM" },
  { label: "Afternoon", time: "02:00 PM" },
  { label: "End of Day", time: "05:00 PM" },
];

const eventTypeOptions = [
  { value: "Company Meeting", label: "Company Meeting" },
  { value: "Product", label: "Product" },
  { value: "Billing", label: "Billing" },
  { value: "Support", label: "Support" },
  { value: "Sales", label: "Sales" },
  { value: "Training", label: "Training" },
  { value: "Compliance", label: "Compliance" },
  { value: "Other", label: "Other" },
];

const departmentOptions = [
  { value: "Sales", label: "Sales" },
  { value: "Support", label: "Support" },
  { value: "Product & Eng", label: "Product & Eng" },
  { value: "Billing", label: "Billing" },
  { value: "Management", label: "Management" },
  { value: "All Departments", label: "All Departments" },
];

const visibilityOptions = [
  { value: "All Employees", label: "All Employees" },
  { value: "Internal Only", label: "Internal Only" },
  { value: "Management Only", label: "Management Only" },
  { value: "Private", label: "Private" },
];

export default function EditEventModal({ isOpen, onClose, event, onUpdateEvent }) {
  // Form starts from the event; the parent remounts this modal (key) for each edit
  const [initial] = useState(() => {
    const date = event?.startDate || new Date().toLocaleDateString("en-CA");
    return { date, month: Number(date.slice(5, 7)) - 1, year: Number(date.slice(0, 4)) };
  });
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [startDate, setStartDate] = useState(initial.date);
  const [startTime, setStartTime] = useState(event?.startTime || event?.time || "09:00 AM");
  const [endDate, setEndDate] = useState(event?.endDate || initial.date);
  const [endTime, setEndTime] = useState(event?.endTime || "10:00 AM");
  const [eventType, setEventType] = useState(eventTypeOptions.some((option) => option.value === event?.eventType) ? event.eventType : "Company Meeting");
  const [department, setDepartment] = useState(event?.department || "Sales");
  const [locationLink, setLocationLink] = useState(event?.locationLink || "");
  const [visibility, setVisibility] = useState(event?.visibility || "All Employees");

  // In-modal active picker ('startDate' | 'startTime' | 'endDate' | 'endTime' | null)
  const [activePicker, setActivePicker] = useState(null);

  // Calendar navigation state for date picker
  const [calMonth, setCalMonth] = useState(initial.month);
  const [calYear, setCalYear] = useState(initial.year);

  // Time custom adjuster state
  const [stepperHour, setStepperHour] = useState(9);
  const [stepperMinute, setStepperMinute] = useState(0);
  const [stepperPeriod, setStepperPeriod] = useState("AM");

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (activePicker) {
          setActivePicker(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, activePicker, onClose]);

  // Open in-modal Date Picker
  const openDatePicker = (field) => {
    const val = field === "startDate" ? startDate : endDate;
    if (val) {
      const d = new Date(`${val}T00:00`);
      if (!isNaN(d.getTime())) {
        setCalMonth(d.getMonth());
        setCalYear(d.getFullYear());
      }
    }
    setActivePicker(field);
  };

  // Open in-modal Time Picker
  const openTimePicker = (field) => {
    const val = field === "startTime" ? startTime : endTime;
    if (val) {
      const parts = val.split(" ");
      const timeParts = (parts[0] || "09:00").split(":");
      const h = parseInt(timeParts[0] || "9", 10);
      const m = parseInt(timeParts[1] || "0", 10);
      setStepperHour(isNaN(h) ? 9 : h);
      setStepperMinute(isNaN(m) ? 0 : m);
      setStepperPeriod(parts[1] === "PM" ? "PM" : "AM");
    }
    setActivePicker(field);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Select date";
    const d = new Date(`${dateStr}T00:00`);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const toDateString = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatTimeStr = (h, m, p) => {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm} ${p}`;
  };

  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    const typeColorMap = {
      "Company Meeting": {
        dot: "bg-purple-500",
        pill: "bg-purple-50 text-purple-700 border border-purple-100",
        weekBorder: "border-l-4 border-purple-500 bg-purple-50 text-purple-700",
        deptTagBg: "bg-purple-100 text-purple-700",
      },
      Product: {
        dot: "bg-teal-500",
        pill: "bg-teal-50 text-teal-700 border border-teal-100",
        weekBorder: "border-l-4 border-teal-500 bg-teal-50 text-teal-700",
        deptTagBg: "bg-teal-100 text-teal-700",
      },
      Billing: {
        dot: "bg-orange-500",
        pill: "bg-orange-50 text-orange-700 border border-orange-100",
        weekBorder: "border-l-4 border-orange-500 bg-orange-50 text-orange-700",
        deptTagBg: "bg-orange-100 text-orange-700",
      },
      Support: {
        dot: "bg-blue-500",
        pill: "bg-blue-50 text-blue-700 border border-blue-100",
        weekBorder: "border-l-4 border-blue-500 bg-blue-50 text-blue-700",
        deptTagBg: "bg-blue-100 text-blue-700",
      },
      Sales: {
        dot: "bg-red",
        pill: "bg-red/10 text-red border border-red/20",
        weekBorder: "border-l-4 border-red bg-red/10 text-red",
        deptTagBg: "bg-red/10 text-red",
      },
      Training: {
        dot: "bg-emerald-500",
        pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        weekBorder: "border-l-4 border-emerald-500 bg-emerald-50 text-emerald-700",
        deptTagBg: "bg-emerald-100 text-emerald-700",
      },
      Compliance: {
        dot: "bg-purple-500",
        pill: "bg-purple-50 text-purple-700 border border-purple-100",
        weekBorder: "border-l-4 border-purple-600 bg-purple-50 text-purple-700",
        deptTagBg: "bg-indigo-100 text-indigo-700",
      },
      Other: {
        dot: "bg-gray-400",
        pill: "bg-light-gray text-medium-black border border-light-gray",
        weekBorder: "border-l-4 border-gray-400 bg-gray-50 text-gray-700",
        deptTagBg: "bg-light-gray text-medium-black",
      },
    };

    const colors = typeColorMap[eventType] || typeColorMap["Company Meeting"];

    const updatedEvent = {
      ...(event || {}),
      id: event?.id || Date.now().toString(),
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      time: startTime || "09:00 AM",
      type: eventType.toLowerCase().replace(" ", "-"),
      eventType,
      department,
      departmentTag: department.toUpperCase(),
      locationLink,
      visibility,
      dotColor: colors.dot,
      pillBg: colors.pill,
      weekBorder: colors.weekBorder || event?.weekBorder,
      deptTagBg: colors.deptTagBg || event?.deptTagBg,
    };

    setSaving(true);
    try {
      await onUpdateEvent?.(updatedEvent);
    } catch (error) {
      toast.error(error.message || "Event not saved");
      return;
    } finally {
      setSaving(false);
    }
    toast.success("Event updated successfully!");
    onClose();
    setActivePicker(null);
  };

  // Calendar days generation
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const currentDateValue = activePicker === "startDate" ? startDate : endDate;
  const currentSelectedObj = currentDateValue ? new Date(`${currentDateValue}T00:00`) : null;

  const isDaySelected = (d) => {
    if (!currentSelectedObj) return false;
    return (
      currentSelectedObj.getDate() === d &&
      currentSelectedObj.getMonth() === calMonth &&
      currentSelectedObj.getFullYear() === calYear
    );
  };

  const handleSelectDay = (day) => {
    const str = toDateString(calYear, calMonth, day);
    if (activePicker === "startDate") {
      setStartDate(str);
    } else {
      setEndDate(str);
    }
    setActivePicker(null);
  };

  const handleSelectTimeSlot = (slot) => {
    if (activePicker === "startTime") {
      setStartTime(slot);
    } else {
      setEndTime(slot);
    }
    setActivePicker(null);
  };

  const handleApplyStepperTime = () => {
    const formatted = formatTimeStr(stepperHour, stepperMinute, stepperPeriod);
    if (activePicker === "startTime") {
      setStartTime(formatted);
    } else {
      setEndTime(formatted);
    }
    setActivePicker(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={onClose}
        >
          {/* Main Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl min-h-[580px] sm:min-h-[620px] rounded-2xl shadow-2xl border border-light-gray relative my-auto flex flex-col justify-between overflow-hidden"
          >
            {/* ── Modal Header ── */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dark-black/90">
                    Edit Event
                  </h3>
                  <p className="text-xs text-medium-black mt-0.5">
                    Update existing event details or schedule.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Modal Form Body ── */}
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5 overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Event Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-dark-black/80">
                    Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Weekly Pipeline Sync"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black/90 placeholder:text-light-black transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-dark-black/80">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide a brief overview of the event's purpose and agenda..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black/90 placeholder:text-light-black resize-none transition-colors"
                  />
                </div>

                {/* ── ROW 1: Start Date & Start Time ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Date Trigger */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black/80">
                      Start Date
                    </label>
                    <button
                      type="button"
                      onClick={() => openDatePicker("startDate")}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-light-gray hover:border-primary/60 bg-white text-xs transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-dark-black/85 truncate">
                          {formatDisplayDate(startDate)}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                      </span>
                    </button>
                  </div>

                  {/* Start Time Trigger */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black/80">
                      Start Time
                    </label>
                    <button
                      type="button"
                      onClick={() => openTimePicker("startTime")}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-light-gray hover:border-primary/60 bg-white text-xs transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-dark-black/85 truncate">
                          {startTime || "Select time"}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                      </span>
                    </button>
                  </div>
                </div>

                {/* ── ROW 2: End Date & End Time ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* End Date Trigger */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black/80">
                      End Date
                    </label>
                    <button
                      type="button"
                      onClick={() => openDatePicker("endDate")}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-light-gray hover:border-primary/60 bg-white text-xs transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-dark-black/85 truncate">
                          {formatDisplayDate(endDate)}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                      </span>
                    </button>
                  </div>

                  {/* End Time Trigger */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black/80">
                      End Time
                    </label>
                    <button
                      type="button"
                      onClick={() => openTimePicker("endTime")}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-light-gray hover:border-primary/60 bg-white text-xs transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-dark-black/85 truncate">
                          {endTime || "Select time"}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                      </span>
                    </button>
                  </div>
                </div>

                {/* ── ROW 3: Event Type & Department ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black/80">
                      Event Type
                    </label>
                    <Dropdown
                      label="Company Meeting"
                      items={eventTypeOptions}
                      selected={eventType}
                      onSelect={setEventType}
                      placement="top"
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black/80">
                      Department
                    </label>
                    <Dropdown
                      label="Sales"
                      items={departmentOptions}
                      selected={department}
                      onSelect={setDepartment}
                      placement="top"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* ── ROW 4: Location / Link & Visibility ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black/80">
                      Location / Link
                    </label>
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Meet link or conference room..."
                        value={locationLink}
                        onChange={(e) => setLocationLink(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black/90 placeholder:text-light-black transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black/80">
                      Visibility
                    </label>
                    <Dropdown
                      label="All Employees"
                      items={visibilityOptions}
                      selected={visibility}
                      onSelect={setVisibility}
                      placement="top"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* ── Modal Action Buttons ── */}
              <div className="flex items-center gap-3 pt-4 border-t border-light-gray mt-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ── IN-MODAL CENTERED OVERLAY FOR DATE PICKER ── */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
              {(activePicker === "startDate" || activePicker === "endDate") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-40 bg-dark-black/40 backdrop-blur-xs flex items-center justify-center p-4"
                  onClick={() => setActivePicker(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-light-gray p-4 flex flex-col gap-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-light-gray">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <CalendarIcon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-dark-black/90">
                          {activePicker === "startDate" ? "Select Start Date" : "Select End Date"}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePicker(null)}
                        className="p-1 rounded-lg text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Month Nav */}
                    <div className="flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (calMonth === 0) {
                            setCalMonth(11);
                            setCalYear((y) => y - 1);
                          } else {
                            setCalMonth((m) => m - 1);
                          }
                        }}
                        className="w-7 h-7 rounded-lg border border-light-gray/80 flex items-center justify-center text-medium-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-dark-black/80">
                          {MONTH_NAMES[calMonth]}
                        </span>
                        <span className="text-xs font-semibold text-medium-black">
                          {calYear}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (calMonth === 11) {
                            setCalMonth(0);
                            setCalYear((y) => y + 1);
                          } else {
                            setCalMonth((m) => m + 1);
                          }
                        }}
                        className="w-7 h-7 rounded-lg border border-light-gray/80 flex items-center justify-center text-medium-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-light-black uppercase">
                      {DAY_NAMES.map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div
                          key={`prev-${i}`}
                          className="h-8 flex items-center justify-center text-[11px] text-light-black/40"
                        >
                          {prevMonthDays - firstDayIndex + i + 1}
                        </div>
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const active = isDaySelected(day);
                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => handleSelectDay(day)}
                            className={`h-8 w-full rounded-xl text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                              active
                                ? "bg-primary text-white shadow-xs font-bold"
                                : "text-dark-black/75 hover:bg-primary/10 hover:text-primary font-medium"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-light-gray text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          setCalMonth(today.getMonth());
                          setCalYear(today.getFullYear());
                          handleSelectDay(today.getDate());
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-light-gray/60 hover:bg-light-gray text-medium-black font-medium transition-colors text-center cursor-pointer"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextWeek = new Date();
                          nextWeek.setDate(nextWeek.getDate() + 7);
                          setCalMonth(nextWeek.getMonth());
                          setCalYear(nextWeek.getFullYear());
                          handleSelectDay(nextWeek.getDate());
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-light-gray/60 hover:bg-light-gray text-medium-black font-medium transition-colors text-center cursor-pointer"
                      >
                        +1 Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePicker(null)}
                        className="flex-1 py-1.5 rounded-lg bg-primary text-white font-bold transition-colors text-center cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ── IN-MODAL CENTERED OVERLAY FOR TIME PICKER ── */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
              {(activePicker === "startTime" || activePicker === "endTime") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-40 bg-dark-black/40 backdrop-blur-xs flex items-center justify-center p-4"
                  onClick={() => setActivePicker(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-light-gray p-4 flex flex-col gap-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-light-gray">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-dark-black/90">
                          {activePicker === "startTime" ? "Select Start Time" : "Select End Time"}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePicker(null)}
                        className="p-1 rounded-lg text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stepper Header */}
                    <div className="bg-light-gray/40 rounded-xl p-2.5 border border-light-gray/60 flex items-center justify-between gap-2">
                      {/* Hour */}
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-light-gray/80">
                        <span className="text-xs font-bold text-dark-black/85 w-5 text-center">
                          {String(stepperHour).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col -space-y-1">
                          <button
                            type="button"
                            onClick={() => setStepperHour((h) => (h >= 12 ? 1 : h + 1))}
                            className="text-light-black hover:text-primary p-0.5"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStepperHour((h) => (h <= 1 ? 12 : h - 1))}
                            className="text-light-black hover:text-primary p-0.5"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-medium-black">:</span>

                      {/* Minute */}
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-light-gray/80">
                        <span className="text-xs font-bold text-dark-black/85 w-5 text-center">
                          {String(stepperMinute).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col -space-y-1">
                          <button
                            type="button"
                            onClick={() => setStepperMinute((m) => (m >= 45 ? 0 : m + 15))}
                            className="text-light-black hover:text-primary p-0.5"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStepperMinute((m) => (m <= 0 ? 45 : m - 15))}
                            className="text-light-black hover:text-primary p-0.5"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* AM / PM */}
                      <div className="flex items-center bg-light-gray p-0.5 rounded-lg border border-light-gray/80">
                        {["AM", "PM"].map((p) => {
                          const isActive = stepperPeriod === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setStepperPeriod(p)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                isActive
                                  ? "bg-primary text-white shadow-2xs"
                                  : "text-medium-black hover:text-dark-black"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="grid grid-cols-4 gap-1">
                      {TIME_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSelectTimeSlot(preset.time)}
                          className="py-1 px-1.5 text-[10px] font-medium text-dark-black/75 bg-light-gray/50 hover:bg-primary/10 hover:text-primary rounded-lg border border-light-gray/40 transition-colors text-center truncate cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Scrollable Slots Grid */}
                    <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1 border-t border-light-gray/60 pt-2">
                      {TIME_SLOTS.map((slot) => {
                        const currentVal = activePicker === "startTime" ? startTime : endTime;
                        const isSel = currentVal === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleSelectTimeSlot(slot)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                              isSel
                                ? "bg-primary text-white font-bold shadow-xs"
                                : "bg-light-gray/30 border border-light-gray/60 text-dark-black/75 hover:border-primary/40 hover:text-primary"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={handleApplyStepperTime}
                      className="w-full py-2 bg-primary hover:bg-medium-teal text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer mt-1"
                    >
                      Apply Time ({formatTimeStr(stepperHour, stepperMinute, stepperPeriod)})
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

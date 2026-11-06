"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Check,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const PRIORITY_OPTIONS = [
  { value: "Normal", label: "Normal" },
  { value: "Important", label: "Important" },
  { value: "Urgent", label: "Urgent" },
  { value: "Low", label: "Low" },
];

const AUDIENCE_OPTIONS = [
  { value: "All Employees", label: "All Employees" },
  { value: "All Sales Reps", label: "All Sales Reps" },
  { value: "Managers", label: "Managers" },
  { value: "Support Team", label: "Support Team" },
  { value: "HQ Operations", label: "HQ Operations" },
];

const EXPIRY_OPTIONS = [
  { value: "No expiry", label: "No expiry" },
  { value: "24 hours", label: "24 hours" },
  { value: "3 days", label: "3 days" },
  { value: "7 days", label: "7 days" },
  { value: "14 days", label: "14 days" },
  { value: "30 days", label: "30 days" },
  { value: "Custom date", label: "Custom date" },
];

const pad = (value) => String(value).padStart(2, "0");
const localDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const localTime = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
const EXPIRY_DAYS = { "24 hours": 1, "3 days": 3, "7 days": 7, "14 days": 14, "30 days": 30 };
const cap = (value) => value.charAt(0).toUpperCase() + value.slice(1);

// Mounted only while open. `announcement` edits an existing one; onSave(body) may throw to keep it open.
export default function AddAnnouncementModal({ isOpen, onClose, onSave, announcement = null }) {
  const editing = Boolean(announcement);
  // Dates are read once when the dialog opens
  const [today] = useState(() => localDate(new Date()));
  const startAt = announcement ? new Date(announcement.publishAt) : null;
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [priority, setPriority] = useState(announcement ? cap(announcement.priority) : "Normal");
  const [audience, setAudience] = useState(announcement?.audience ?? "All Employees");
  const [message, setMessage] = useState(announcement?.body ?? "");
  const [publishTiming, setPublishTiming] = useState(announcement?.status === "scheduled" ? "later" : "now");
  const [scheduleDate, setScheduleDate] = useState(() => localDate(startAt && announcement.status === "scheduled" ? startAt : new Date(Date.now() + 86400000)));
  const [scheduleTime, setScheduleTime] = useState(startAt && announcement.status === "scheduled" ? localTime(startAt) : "09:00");
  const [expiryDate, setExpiryDate] = useState(announcement?.expiresAt ? "Custom date" : "No expiry");
  const [customExpiry, setCustomExpiry] = useState(() => localDate(announcement?.expiresAt ? new Date(announcement.expiresAt) : new Date(Date.now() + 7 * 86400000)));
  const [sendNotification, setSendNotification] = useState(announcement?.notify ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }
    // Times are entered in the browser's time zone and sent as ISO (UTC)
    const later = publishTiming === "later";
    const publishAt = later ? new Date(`${scheduleDate}T${scheduleTime || "09:00"}`) : editing && announcement.status !== "scheduled" ? new Date(announcement.publishAt) : new Date();
    const expiresAt =
      expiryDate === "No expiry" ? null : expiryDate === "Custom date" ? new Date(`${customExpiry}T23:59`) : new Date(publishAt.getTime() + EXPIRY_DAYS[expiryDate] * 86400000);
    setSaving(true);
    try {
      await onSave?.({
        title: title.trim(),
        body: message.trim(),
        priority: priority.toLowerCase(),
        audience,
        ...((later || !editing || announcement.status === "scheduled") && { publishAt: publishAt.toISOString() }),
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        notify: sendNotification,
      });
      toast.success(editing ? "Announcement updated" : later ? "Announcement scheduled" : "Announcement published");
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-light-gray relative my-auto flex flex-col justify-between overflow-hidden"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray shrink-0 bg-white">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
                {editing ? "Edit Announcement" : "Add Announcement"}
              </h3>
              <p className="text-xs text-medium-black mt-0.5 font-normal">
                {editing ? "Changes show for everyone in the audience." : "Create and share an update with your team."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Form Body ── */}
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]"
          >
            {/* 1. Announcement Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="announcement-title" className="text-xs font-semibold text-dark-black/80">
                Announcement title
              </label>
              <input
                id="announcement-title"
                type="text"
                placeholder="Enter announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={160}
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black/90 placeholder:text-light-black transition-colors"
              />
            </div>

            {/* 2. Priority & Audience Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">
                  Priority
                </label>
                <Dropdown
                  label="Normal"
                  items={PRIORITY_OPTIONS}
                  selected={priority}
                  onSelect={setPriority}
                  placement="bottom"
                  buttonClassName="py-2.5 text-xs sm:text-sm"
                  className="w-full"
                />
              </div>

              {/* Audience */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">
                  Audience
                </label>
                <Dropdown
                  label="All Employees"
                  items={AUDIENCE_OPTIONS}
                  selected={audience}
                  onSelect={setAudience}
                  placement="bottom"
                  buttonClassName="py-2.5 text-xs sm:text-sm"
                  className="w-full"
                />
              </div>
            </div>

            {/* 3. Message Textarea with Character Counter */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="announcement-message" className="text-xs font-semibold text-dark-black/80">
                Message
              </label>
              <div className="relative">
                <textarea
                  id="announcement-message"
                  rows={4}
                  maxLength={1000}
                  placeholder="Write your announcement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pb-6 text-xs sm:text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black/90 placeholder:text-light-black resize-none transition-colors"
                />
                <div className="absolute right-3 bottom-2.5 text-[10px] text-light-black font-medium pointer-events-none">
                  {message.length}/1000
                </div>
              </div>
            </div>

            {/* 4. Publish Timing (Radio options) */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-xs font-semibold text-dark-black/80">
                Publish timing
              </label>
              <div className="flex items-center gap-6">
                {/* Publish now radio */}
                <label
                  onClick={() => setPublishTiming("now")}
                  className="flex items-center gap-2 cursor-pointer select-none group"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      publishTiming === "now"
                        ? "border-primary bg-primary"
                        : "border-light-black/40 bg-white group-hover:border-medium-black"
                    }`}
                  >
                    {publishTiming === "now" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      publishTiming === "now"
                        ? "font-semibold text-dark-black"
                        : "font-normal text-medium-black"
                    }`}
                  >
                    Publish now
                  </span>
                </label>

                {/* Schedule for later radio */}
                <label
                  onClick={() => setPublishTiming("later")}
                  className="flex items-center gap-2 cursor-pointer select-none group"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      publishTiming === "later"
                        ? "border-primary bg-primary"
                        : "border-light-black/40 bg-white group-hover:border-medium-black"
                    }`}
                  >
                    {publishTiming === "later" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      publishTiming === "later"
                        ? "font-semibold text-dark-black"
                        : "font-normal text-medium-black"
                    }`}
                  >
                    Schedule for later
                  </span>
                </label>
              </div>

              {/* Conditional Schedule Date & Time inputs */}
              {publishTiming === "later" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-3 pt-2"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-light-black">
                      Broadcast Date
                    </span>
                    <input
                      type="date"
                      min={today}
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black/90"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-light-black">
                      Broadcast Time
                    </span>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black/90"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* 5. Expiry Date Dropdown with Calendar Icon */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-xs font-semibold text-dark-black/80">
                Expiry date <span className="text-light-black font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Dropdown
                  label="No expiry"
                  items={EXPIRY_OPTIONS}
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  placement="top"
                  icon={<CalendarIcon className="w-4 h-4 text-light-black" />}
                  buttonClassName="py-2.5 text-xs sm:text-sm"
                  className="w-full"
                />
              </div>
              {expiryDate === "Custom date" && (
                <input
                  type="date"
                  aria-label="Expiry date"
                  min={today}
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black/90"
                />
              )}
            </div>

            {/* 6. Checkbox: Send email and in-app notification */}
            <div className="pt-2">
              <label
                onClick={() => setSendNotification(!sendNotification)}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    sendNotification
                      ? "bg-primary border-primary text-white"
                      : "border-light-black/40 bg-white group-hover:border-medium-black"
                  }`}
                >
                  {sendNotification && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs font-medium text-dark-black/90">
                  Send email and in-app notification
                </span>
              </label>
              <p className="text-[11px] text-light-black mt-1 ml-6">It appears on everyone&apos;s Calendar page now; emails go out once an email service is connected.</p>
            </div>

            {/* ── Footer Action Buttons ── */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-light-gray mt-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="text-xs sm:text-sm font-semibold text-medium-black hover:text-dark-black transition-colors cursor-pointer px-1 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="disabled:opacity-60 px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                {saving ? "Saving…" : editing ? "Save Changes" : publishTiming === "later" ? "Schedule Announcement" : "Publish Announcement"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

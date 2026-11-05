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

export default function AddAnnouncementModal({
  isOpen,
  onClose,
  onAddAnnouncement,
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [audience, setAudience] = useState("All Employees");
  const [message, setMessage] = useState("");
  const [publishTiming, setPublishTiming] = useState("now"); // 'now' | 'later'
  const [scheduleDate, setScheduleDate] = useState("2024-05-25");
  const [scheduleTime, setScheduleTime] = useState("09:00 AM");
  const [expiryDate, setExpiryDate] = useState("No expiry");
  const [sendNotification, setSendNotification] = useState(true);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    const priorityConfig = {
      Urgent: {
        level: "URGENT",
        levelBg: "bg-red/10 text-red border border-red/20",
        iconBg: "bg-red/10 text-red",
        liveBg: "bg-red/10 text-red",
      },
      Important: {
        level: "IMPORTANT",
        levelBg: "bg-amber-50 text-amber-600 border border-amber-100",
        iconBg: "bg-amber-50 text-amber-600",
        liveBg: "bg-amber-50 text-amber-600",
      },
      Normal: {
        level: "NORMAL",
        levelBg: "bg-blue-50 text-blue-600 border border-blue-100",
        iconBg: "bg-blue-50 text-blue-600",
        liveBg: "bg-emerald-50 text-emerald-600",
        hasDot: true,
      },
      Low: {
        level: "NORMAL",
        levelBg: "bg-light-gray text-medium-black border border-light-gray",
        iconBg: "bg-light-gray text-medium-black",
        liveBg: "bg-light-gray text-medium-black",
      },
    };

    const isScheduled = publishTiming === "later";
    const cfg = priorityConfig[priority] || priorityConfig["Normal"];

    const newAnnouncement = {
      id: Date.now().toString(),
      title: title.trim(),
      body: message.trim(),
      level: isScheduled ? "SCHEDULED" : cfg.level,
      levelBg: isScheduled
        ? "bg-purple-50 text-purple-600 border border-purple-100"
        : cfg.levelBg,
      iconBg: isScheduled ? "bg-purple-50 text-purple-600" : cfg.iconBg,
      liveBg: isScheduled ? "bg-purple-50 text-purple-600" : cfg.liveBg,
      hasDot: !isScheduled && cfg.hasDot,
      audience,
      author: "Super Admin",
      date: isScheduled
        ? new Date(scheduleDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "May 20, 2024",
      expiryDate,
      sendNotification,
    };

    onAddAnnouncement?.(newAnnouncement);
    toast.success(
      isScheduled
        ? "Announcement scheduled successfully!"
        : "Announcement published successfully!"
    );
    onClose();
    setTitle("");
    setMessage("");
    setPriority("Normal");
    setAudience("All Employees");
    setPublishTiming("now");
    setExpiryDate("No expiry");
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
                Add Announcement
              </h3>
              <p className="text-xs text-medium-black mt-0.5 font-normal">
                Create and share an update with your team.
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
              <label className="text-xs font-semibold text-dark-black/80">
                Announcement title
              </label>
              <input
                type="text"
                placeholder="Enter announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
              <label className="text-xs font-semibold text-dark-black/80">
                Message
              </label>
              <div className="relative">
                <textarea
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
                      type="text"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      placeholder="09:00 AM"
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
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                {publishTiming === "later"
                  ? "Schedule Announcement"
                  : "Publish Announcement"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

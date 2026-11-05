"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ArrowRight,
  MapPin,
  Link2,
} from "lucide-react";

export default function DayEventsModal({
  isOpen,
  onClose,
  day,
  events = [],
  onSelectEvent,
  onAddEventForDay,
}) {
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

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-light-gray overflow-hidden relative my-auto flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-light-gray shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark-black/90">
                  {day ? new Date(`${day}T00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ""}
                </h3>
                <p className="text-xs text-medium-black mt-0.5">
                  {events.length} {events.length === 1 ? "Event" : "Events"} scheduled
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

          {/* Events List */}
          <div className="p-5 space-y-3 overflow-y-auto flex-1">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  onSelectEvent(evt);
                }}
                className="p-3.5 rounded-xl border border-light-gray hover:border-primary/50 hover:bg-primary/5 bg-white transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${evt.pillBg || "bg-primary/10 text-primary"
                      }`}
                  >
                    {evt.eventType || evt.type?.replace("-", " ") || "Event"}
                  </span>

                  <div className="flex items-center gap-1 text-xs text-medium-black font-semibold">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{evt.time}</span>
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-dark-black group-hover:text-primary transition-colors">
                  {evt.title}
                </h4>

                {evt.description && (
                  <p className="text-[11px] text-light-black line-clamp-1 mt-1">
                    {evt.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-light-gray/60 text-[10px] text-light-black">
                  <span>{evt.department || "All Departments"}</span>
                  <span className="font-semibold text-primary inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>View details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="text-center py-8 text-xs text-light-black">
                No events on this day.
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-light-gray bg-light-gray/20 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddEventForDay?.(day);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event for {day ? new Date(`${day}T00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "this day"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-medium-teal rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

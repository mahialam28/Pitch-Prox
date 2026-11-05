"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Link2,
  Users,
  Eye,
  Trash2,
  ExternalLink,
  Copy,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import EditEventModal from "./edit-event-modal";

export default function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onDeleteEvent,
  onUpdateEvent,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Closing the details modal also closes the editor (adjusted during render, not in an effect)
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setIsEditModalOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isEditModalOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isEditModalOpen, onClose]);

  if (!event) return null;

  const handleCopyLink = () => {
    if (event.locationLink) {
      navigator.clipboard?.writeText(event.locationLink);
      toast.success("Meeting link copied to clipboard!");
    } else {
      toast.success("Link copied!");
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteEvent?.(event.id);
    } catch (error) {
      toast.error(error.message || "Event not deleted");
      return;
    }
    toast.success("Event removed from calendar");
    onClose();
  };

  // EditEventModal shows its own success/error toast; a failure keeps it open
  const handleSaveEditedEvent = async (updated) => {
    await onUpdateEvent?.(updated);
    setIsEditModalOpen(false);
    onClose();
  };
  const canEdit = event?.canEdit !== false;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isEditModalOpen && (
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs overflow-y-auto"
            onClick={onClose}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-light-gray overflow-hidden relative my-auto flex flex-col"
            >
              {/* ── Modal Header with Event Color Pill ── */}
              <div className="p-5 sm:p-6 border-b border-light-gray shrink-0 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          event.pillBg || "bg-primary/10 text-primary"
                        }`}
                      >
                        {event.eventType || event.type?.replace("-", " ") || "Event"}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-dark-black leading-snug">
                      {event.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Modal Body Details ── */}
              <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                {/* Date & Time Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-3.5 bg-light-gray/40 rounded-xl border border-light-gray/70">
                  <div className="flex items-center gap-2 text-dark-black/85 font-semibold">
                    <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      {event.startDate
                        ? new Date(`${event.startDate}T00:00`).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-dark-black/85 font-semibold">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      {event.time || "10:00 AM"}{" "}
                      {event.endTime ? `– ${event.endTime}` : ""}
                    </span>
                  </div>
                </div>

                {/* Department & Visibility Meta Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-light-gray rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-light-black uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      Department
                    </span>
                    <p className="text-xs font-bold text-dark-black/90">
                      {event.department || "All Departments"}
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-light-gray rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-light-black uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      Visibility
                    </span>
                    <p className="text-xs font-bold text-dark-black/90">
                      {event.visibility || "All Employees"}
                    </p>
                  </div>
                </div>

                {/* Location / Meeting Link */}
                <div className="p-3.5 bg-white border border-light-gray rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-light-black uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-primary" />
                    Location / Meeting Link
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-dark-black/85 truncate">
                      {event.locationLink || "No link added"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Description / Agenda */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-dark-black/80">
                    Agenda & Description
                  </span>
                  <p className="text-xs text-medium-black leading-relaxed p-3 bg-light-gray/30 rounded-xl border border-light-gray/60">
                    {event.description ||
                      "Review pipeline metrics, upcoming product roadmap milestones, and team support coverage goals for the week."}
                  </p>
                </div>
              </div>

              {/* ── Modal Footer Actions ── */}
              {canEdit ? (
              <div className="p-5 sm:p-6 pt-3 border-t border-light-gray bg-light-gray/20 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red hover:bg-red/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Event</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-medium-teal rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Event</span>
                  </button>
                </div>
              </div>
              ) : (
                <p className="p-5 sm:p-6 pt-3 border-t border-light-gray bg-light-gray/20 text-xs text-medium-black">
                  {event.source === "follow-up" ? "This is a lead follow-up. Change it from Leads." : `Created by ${event.ownerName}. Only they can change it.`}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <EditEventModal
        key={isEditModalOpen ? `edit-${event.id}` : "closed"}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        onUpdateEvent={handleSaveEditedEvent}
      />
    </>
  );
}

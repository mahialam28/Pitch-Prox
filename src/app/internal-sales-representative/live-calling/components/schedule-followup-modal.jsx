"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Check, Bell } from "lucide-react";
import toast from "react-hot-toast";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const followUpTypes = [
  "Demo Walkthrough",
  "Proposal Review",
  "Callback / Check-in",
  "Closing Call",
];

const ScheduleFollowUpModal = ({ isOpen, onClose, leadName = "", phoneNumber = "" }) => {
  const [followUpType, setFollowUpType] = useState("Demo Walkthrough");
  const [date, setDate] = useState("2026-09-02");
  const [time, setTime] = useState("10:00 AM");
  const [agenda, setAgenda] = useState("Live platform demonstration and pricing walkthrough.");

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

  const handleSchedule = (e) => {
    e.preventDefault();
    toast.success(`Follow-up scheduled for ${date} at ${time}!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-dark-black/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.65 }}
          >
            <div
              className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl pointer-events-auto border border-light-gray max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-light-gray">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <Title variant="small" className="!text-dark-black/80 font-bold">
                      Schedule Follow-Up
                    </Title>
                    <Text variant="small" className="text-light-black text-xs">
                      {leadName ? `Follow-up with ${leadName}` : "Set calendar appointment"}
                    </Text>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-medium-black hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSchedule} className="mt-4 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-medium-black uppercase tracking-wider mb-2">
                    Follow-Up Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {followUpTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFollowUpType(type)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
                          followUpType === type
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-light-gray text-medium-black hover:border-slate-300"
                        }`}
                      >
                        <span>{type}</span>
                        {followUpType === type && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-medium-black uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-light-gray p-2.5 text-xs font-semibold text-dark-black focus:outline-hidden focus:border-primary transition-colors cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-medium-black uppercase tracking-wider mb-1.5">
                      Time
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="e.g. 10:00 AM"
                        className="w-full rounded-xl border border-light-gray p-2.5 text-xs font-semibold text-dark-black focus:outline-hidden focus:border-primary transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Agenda / Notes */}
                <div>
                  <label className="block text-xs font-bold text-medium-black uppercase tracking-wider mb-1.5">
                    Agenda & Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Specify demo focus, attendee notes, or deliverables..."
                    className="w-full rounded-xl border border-light-gray p-3 text-xs text-dark-black placeholder:text-light-black focus:outline-hidden focus:border-primary transition-colors resize-none"
                  />
                </div>

                {/* Reminder Notification */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-medium-black">
                  <Bell className="w-4 h-4 text-primary shrink-0" />
                  <span>Calendar invite and reminder will be sent 15 mins prior.</span>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray/50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Event</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScheduleFollowUpModal;

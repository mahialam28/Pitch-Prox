"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Clock, CheckCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest, formatDate } from "@/lib/client-api";

// Employees past the deadline (GET /api/v1/compliance/policies/overdue). Reminders are queued as
// emails (sent once an email service is connected) and recorded in the audit log.
export default function OverdueAcknowledgmentsModal({ isOpen, onClose, canRemind = false }) {
  const [people, setPeople] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => apiRequest("/api/v1/compliance/policies/overdue").then((data) => setPeople(data.results));
  useEffect(() => {
    if (!isOpen) return;
    apiRequest("/api/v1/compliance/policies/overdue")
      .then((data) => setPeople(data.results))
      .catch((error) => toast.error(error.message));
  }, [isOpen]);

  if (!isOpen) return null;

  const remind = async (userIds, key) => {
    setBusy(key);
    try {
      const result = await apiRequest("/api/v1/compliance/policies/reminders", { method: "POST", body: { userIds } });
      toast.success(`Reminder queued for ${result.reminded} employee${result.reminded === 1 ? "" : "s"}. It's emailed once an email service is connected.`);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(null);
    }
  };

  const count = people?.length ?? 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="overdue-title"
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          <div className="p-5 sm:p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 id="overdue-title" className="text-lg font-bold text-dark-black/85 font-secondary">Overdue Policy Acknowledgments ({people ? count : "…"})</h3>
                <p className="text-xs text-light-black">Employees who haven&apos;t signed a policy by its deadline.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray/70 flex items-center justify-center transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
            {!people && <p className="text-xs text-light-black text-center py-6">Loading...</p>}
            {people && count === 0 && <p className="text-xs text-light-black text-center py-6">Everyone is up to date. No overdue acknowledgments.</p>}
            {people?.map((person) => (
              <div key={person.id} className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-dark-black/85 text-xs sm:text-sm font-secondary">{person.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {person.daysOverdue} day{person.daysOverdue === 1 ? "" : "s"} overdue
                    </span>
                  </div>
                  <div className="text-xs text-medium-black">{person.policies.map((policy) => policy.title).join(", ")}</div>
                  <div className="text-[11px] text-light-black flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {person.lastReminderAt ? `Last reminded ${formatDate(person.lastReminderAt)}` : "Not reminded yet"}
                  </div>
                </div>
                {canRemind && (
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => remind([person.id], person.id)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-primary/40 hover:bg-primary hover:text-white text-primary text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {busy === person.id ? "Sending..." : "Send Reminder"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 sm:px-6 border-t border-light-gray flex items-center justify-between gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-dark-black/70 hover:bg-light-gray rounded-xl transition-colors cursor-pointer">Dismiss</button>
            {canRemind && count > 0 && (
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => remind([], "all")}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-[#0c9593] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                {busy === "all" ? "Sending..." : `Notify All Overdue (${count})`}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

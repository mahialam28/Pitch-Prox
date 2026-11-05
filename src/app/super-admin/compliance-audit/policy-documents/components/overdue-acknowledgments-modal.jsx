"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Clock,
  CheckCheck,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

const overdueUsers = [
  {
    id: "ov-1",
    name: "David Miller",
    email: "david.m@pitchprox.com",
    department: "Engineering",
    policy: "Access Control Policy v1.4",
    daysOverdue: 3,
    assignedDate: "Apr 20, 2024",
    dueDate: "May 01, 2024",
  },
  {
    id: "ov-2",
    name: "Tony Stark",
    email: "tony@pitchprox.com",
    department: "Engineering",
    policy: "Information Security Policy v2.1",
    daysOverdue: 6,
    assignedDate: "Apr 15, 2024",
    dueDate: "Apr 28, 2024",
  },
  {
    id: "ov-3",
    name: "Amanda Wilson",
    email: "amanda@pitchprox.com",
    department: "Sales Operations",
    policy: "Acceptable Use Policy v1.0",
    daysOverdue: 2,
    assignedDate: "Apr 22, 2024",
    dueDate: "May 02, 2024",
  },
];

export default function OverdueAcknowledgmentsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleRemindSingle = (name) => {
    toast.success(`Urgent reminder sent to ${name}`);
  };

  const handleRemindAll = () => {
    toast.success("Broadcast reminder sent to all 3 overdue employees!");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-black/85 font-secondary">
                  Overdue Policy Acknowledgments (3)
                </h3>
                <p className="text-xs text-light-black">
                  Staff members with pending compliance signatures beyond deadline.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
            {overdueUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark-black/85 text-xs sm:text-sm font-secondary">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {user.daysOverdue} days overdue
                    </span>
                  </div>
                  <div className="text-xs text-medium-black">
                    <span className="font-medium text-dark-black/80">{user.policy}</span> • {user.department}
                  </div>
                  <div className="text-[11px] text-light-black flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due date: {user.dueDate} (Assigned {user.assignedDate})
                  </div>
                </div>

                <button
                  onClick={() => handleRemindSingle(user.name)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-primary/40 hover:bg-primary hover:text-white text-primary text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Reminder
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 sm:px-6 border-t border-light-gray flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-dark-black/70 hover:bg-light-gray rounded-xl transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={handleRemindAll}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-[#0c9593] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Notify All Overdue (3)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

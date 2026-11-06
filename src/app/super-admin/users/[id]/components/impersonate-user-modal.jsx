"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Shield,
  LayoutGrid,
  Phone,
  Users,
  FileText,
  Settings,
  Receipt,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";

const DURATION_OPTIONS = [
  { value: "15m", label: "15 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour (Recommended)" },
  { value: "2h", label: "2 Hours" },
  { value: "4h", label: "4 Hours" },
  { value: "logout", label: "Until Logout" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];


export default function ImpersonateUserModal({
  isOpen = false,
  onClose = () => {},
  user = {
    name: "Jennifer Smith",
    initials: "JS",
    status: "Active",
    company: "Acme Inc.",
    email: "jennifer.smith@acme.com",
    phone: "(555) 123-4567",
    industry: "Real Estate",
    timeZone: "(GMT-05:00) Eastern Time (US & Canada)",
  },
  onConfirm = () => {},
}) {
  const [duration, setDuration] = useState("1h");
  const [accessLevel, setAccessLevel] = useState("full"); // "full" | "readonly"
  const [reason, setReason] = useState("Helping user troubleshoot billing issue");
  const [language, setLanguage] = useState("en");
  // Who to sign in as: the account's members (owner first), when the page knows them
  const memberOptions = user.members?.length ? user.members.map((member) => ({ value: member.id, label: `${member.name}${member.role === "customer_admin" ? " (Owner)" : ""}` })) : [{ value: "owner", label: `${user.name} (Owner)` }];
  const [memberId, setMemberId] = useState(memberOptions[0].value);
  const [isAcknowledged, setIsAcknowledged] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for impersonation.");
      return;
    }
    if (!isAcknowledged) {
      toast.error("Please confirm acknowledgment before proceeding.");
      return;
    }

    // The caller starts the session; on failure it reports the error and the modal stays open
    try {
      setSubmitting(true);
      await onConfirm?.({ duration, accessLevel, reason: reason.trim(), userId: memberId === "owner" ? undefined : memberId });
      onClose();
    } catch {
      /* reported by the caller */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8 max-h-[92vh] flex flex-col"
        >
          {/* ── 1. Modal Header ── */}
          <div className="p-6 sm:p-7 pb-4 border-b border-light-gray flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-dark-black tracking-tight">
                Impersonate User
              </h2>
              <p className="text-xs text-light-black font-normal mt-1">
                You are about to access the account as this user. All actions will be logged.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── 2. Modal Body (Scrollable) ── */}
          <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
            {/* Warning Alert Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-amber-950">
                  You will be able to view and interact with the system as this user.
                </span>
                <span className="text-amber-800/90 font-medium">
                  Some actions may be restricted based on the user&apos;s permissions.
                </span>
              </div>
            </div>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ── Col 1: User Profile & Details (4.5 cols / ~38%) ── */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-light-gray/80 p-5 flex flex-col gap-4 shadow-2xs">
                {/* User Identity Header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-light-gray/60">
                  <div className="w-13 h-13 rounded-full bg-[#0E4F4F] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                    {user.initials || "JS"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-dark-black truncate">
                        {user.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200">
                        {user.status || "Active"}
                      </span>
                    </div>
                    <span className="text-xs text-light-black font-medium mt-0.5">
                      {user.company || "Acme Inc."}
                    </span>
                  </div>
                </div>

                {/* Details List */}
                <div className="divide-y divide-light-gray/50 text-xs">
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-light-black font-medium">Full Name</span>
                    <span className="font-semibold text-dark-black/90">
                      {user.name}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-light-black font-medium">Email</span>
                    <div className="flex items-center gap-1.5 font-medium text-dark-black/90">
                      <span className="truncate">{user.email || "jennifer.smith@acme.com"}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-light-black font-medium">Phone</span>
                    <div className="flex items-center gap-1.5 font-medium text-dark-black/90">
                      <span>{user.phone || "(555) 123-4567"}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-light-black font-medium">Company</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-dark-black/90">
                        {user.company || "Acme Inc."}
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-light-black font-medium">Industry</span>
                    <span className="font-semibold text-dark-black/90">
                      {user.industry || "Real Estate"}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-light-black font-medium">Time Zone</span>
                    <span className="font-semibold text-dark-black/90 text-right">
                      {user.timeZone || "(GMT-05:00) Eastern Time (US & Canada)"}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-light-black font-medium">Language</span>
                    <div className="w-[120px]">
                      <Dropdown
                        items={LANGUAGE_OPTIONS}
                        selected={language}
                        onSelect={setLanguage}
                        variant="small"
                        className="w-full"
                        buttonClassName="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 flex items-center justify-between gap-2">
                    <span className="text-light-black font-medium">Sign In As</span>
                    <div className="w-[180px]">
                      <Dropdown
                        items={memberOptions}
                        selected={memberId}
                        onSelect={setMemberId}
                        variant="small"
                        className="w-full"
                        buttonClassName="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Col 2: Session Options & Reason (4 cols / ~34%) ── */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <span className="text-[11px] font-bold uppercase text-dark-black tracking-wider">
                  SESSION OPTIONS
                </span>

                {/* 1. Session Duration */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 text-xs font-semibold text-dark-black/90">
                    <span>Session Duration</span>
                    <HelpCircle className="w-3.5 h-3.5 text-light-black/70" />
                  </div>
                  <Dropdown
                    items={DURATION_OPTIONS}
                    selected={duration}
                    onSelect={setDuration}
                    variant="small"
                    className="w-full"
                    buttonClassName="h-9 text-xs font-semibold"
                  />
                  <span className="text-[11px] text-light-black italic">
                    You will be automatically logged out when the session ends.
                  </span>
                </div>

                {/* 2. Access Level */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-xs font-semibold text-dark-black/90">
                    <span>Access Level</span>
                    <HelpCircle className="w-3.5 h-3.5 text-light-black/70" />
                  </div>

                  {/* Radio Card 1: Full Access */}
                  <div
                    onClick={() => setAccessLevel("full")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      accessLevel === "full"
                        ? "border-teal-500 bg-teal-50/25 ring-1 ring-teal-500"
                        : "border-light-gray bg-white hover:bg-light-gray/20"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-teal-50 text-primary border border-teal-100 shrink-0 mt-0.5">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-dark-black">
                          Full Access
                        </span>
                        <span className="text-[11px] text-light-black">
                          Access all features and data as this user
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        accessLevel === "full"
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-light-gray bg-white"
                      }`}
                    >
                      {accessLevel === "full" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Radio Card 2: Read Only */}
                  <div
                    onClick={() => setAccessLevel("readonly")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      accessLevel === "readonly"
                        ? "border-teal-500 bg-teal-50/25 ring-1 ring-teal-500"
                        : "border-light-gray bg-white hover:bg-light-gray/20"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-light-gray text-light-black shrink-0 mt-0.5">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-dark-black">
                          Read Only
                        </span>
                        <span className="text-[11px] text-light-black">
                          View data but cannot make any changes
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        accessLevel === "readonly"
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-light-gray bg-white"
                      }`}
                    >
                      {accessLevel === "readonly" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Reason Textarea */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-semibold text-dark-black/90">
                      <span>Reason</span>
                      <span className="text-teal-600">(Required)</span>
                      <HelpCircle className="w-3.5 h-3.5 text-light-black/70" />
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value.slice(0, 200))}
                    placeholder="Helping user troubleshoot billing issue"
                    required
                    className="w-full px-3 py-2 text-xs font-medium text-dark-black bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="text-right text-[10px] text-light-black">
                    {reason.length}/200
                  </div>
                </div>

                {/* 4. Acknowledgment Checkbox */}
                <label className="flex items-start gap-2.5 text-xs text-medium-black cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAcknowledged}
                    onChange={(e) => setIsAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-light-gray text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
                  />
                  <span className="text-[11px] leading-snug">
                    I understand that all actions will be logged and attributed to me as Admin.
                  </span>
                </label>
              </div>

              {/* ── Col 3: What You Will See (3.5 cols / ~28%) ── */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase text-dark-black tracking-wider">
                  WHAT YOU WILL SEE
                </span>

                <div className="flex flex-col gap-2">
                  {/* Dashboard */}
                  <div className="p-2.5 sm:p-3 rounded-xl border border-light-gray/80 bg-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-dark-black truncate">
                        Dashboard
                      </span>
                      <span className="text-[10px] text-light-black truncate">
                        User&apos;s dashboard and widgets
                      </span>
                    </div>
                  </div>

                  {/* Calls */}
                  <div className="p-2.5 sm:p-3 rounded-xl border border-light-gray/80 bg-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-dark-black truncate">
                        Calls
                      </span>
                      <span className="text-[10px] text-light-black truncate">
                        Call history and recordings
                      </span>
                    </div>
                  </div>

                  {/* Leads */}
                  <div className="p-2.5 sm:p-3 rounded-xl border border-light-gray/80 bg-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-dark-black truncate">
                        Leads
                      </span>
                      <span className="text-[10px] text-light-black truncate">
                        Leads assigned to this user
                      </span>
                    </div>
                  </div>

                  {/* Reports */}
                  <div className="p-2.5 sm:p-3 rounded-xl border border-light-gray/80 bg-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-dark-black truncate">
                        Reports
                      </span>
                      <span className="text-[10px] text-light-black truncate">
                        Reports and analytics
                      </span>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="p-2.5 sm:p-3 rounded-xl border border-light-gray/80 bg-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-dark-black truncate">
                        Settings
                      </span>
                      <span className="text-[10px] text-light-black truncate">
                        User&apos;s settings and preferences
                      </span>
                    </div>
                  </div>

                  {/* Billing */}
                  <div className="p-2.5 sm:p-3 rounded-xl border border-light-gray/80 bg-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-dark-black truncate">
                        Billing
                      </span>
                      <span className="text-[10px] text-light-black truncate">
                        Billing information and invoices
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-light-black italic mt-1">
                  * Based on user permissions.
                </span>
              </div>
            </div>
          </div>

          {/* ── 3. Modal Footer ── */}
          <div className="p-4 sm:px-7 border-t border-light-gray bg-light-gray/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Security Notice */}
            <div className="flex items-center gap-2 text-xs text-amber-900">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11px] font-medium leading-tight">
                Security Notice: Do not share sensitive information while impersonating. Be sure to log out when you are finished.
              </span>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="disabled:opacity-60 flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-[#0E4F4F] hover:bg-[#093838] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                {submitting ? "Starting…" : "Start Impersonation"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Check,
  LayoutGrid,
  PhoneCall,
  Users,
  FileText,
  Settings,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const durationOptions = [
  { value: "15 Minutes", label: "15 Minutes" },
  { value: "30 Minutes", label: "30 Minutes" },
  { value: "1 Hour (Recommended)", label: "1 Hour (Recommended)" },
  { value: "2 Hours", label: "2 Hours" },
  { value: "4 Hours", label: "4 Hours" },
  { value: "8 Hours", label: "8 Hours" },
];

export default function ImpersonateRepModal({ isOpen, onClose, rep }) {
  const [duration, setDuration] = useState("1 Hour (Recommended)");
  const [accessLevel, setAccessLevel] = useState("full"); // "full" | "readonly"
  const [reason, setReason] = useState("Helping user troubleshoot billing issue");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentRep = rep || {
    id: "EMP-1001",
    name: "Ryan Anderson",
    role: "Sales Representative",
    status: "Active",
    email: "ryan.anderson@pitchprox.com",
    phone: "(512) 555-0198",
    employeeId: "EMP-1001",
    manager: "Sarah Johnson",
    hireDate: "Jan 10, 2024",
    timeZone: "(GMT-05:00) Eastern Time",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160",
    tier: "Elite Performer",
  };

  const handleStartImpersonation = () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for impersonation.");
      return;
    }
    if (!agreed) {
      toast.error("Please acknowledge the audit logging agreement.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Successfully started impersonation session for ${currentRep.name}`);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-light-gray shadow-2xl max-w-5xl lg:max-w-6xl w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
        {/* Scrollable Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 [-ms-overflow-style:none] [scrollbar-width:thin]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight">
                Impersonate
              </h2>
              <p className="text-xs sm:text-sm text-light-black mt-0.5">
                You are about to access the account as this user. All actions will be logged.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Yellow/Amber Warning Box */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">
                You will be able to view and interact with the system as this user.
              </span>
              <br />
              <span className="text-amber-800/90 font-normal">
                Some actions may be restricted based on the user&apos;s permissions.
              </span>
            </div>
          </div>

          {/* 3-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Column 1: Rep Information Card (4 cols) ── */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Profile Avatar on its own row */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-light-gray bg-slate-100 shrink-0">
                <img
                  src={currentRep.avatar}
                  alt={currentRep.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              {/* Name, Status, and Role Details arranged cleanly row-wise */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary whitespace-nowrap">
                    {currentRep.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
                    Active
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-light-black whitespace-nowrap flex-nowrap">
                  <span className="font-medium text-dark-black/60">Sales Representative</span>
                  <span className="text-light-black/40">|</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Elite Performer</span>
                  </span>
                </div>
              </div>

              {/* 5 Rep Info Boxes */}
              <div className="flex flex-col gap-2.5">
                {/* Employee ID */}
                <div className="bg-[#F8FAFC] border border-light-gray rounded-xl px-4 py-2 flex flex-col">
                  <span className="text-[10px] font-medium text-light-black uppercase tracking-wider">
                    Employee ID
                  </span>
                  <span className="text-xs font-bold text-dark-black/90 mt-0.5">
                    {currentRep.employeeId || "EMP-1001"}
                  </span>
                </div>

                {/* Email */}
                <div className="bg-[#F8FAFC] border border-light-gray rounded-xl px-4 py-2 flex flex-col">
                  <span className="text-[10px] font-medium text-light-black uppercase tracking-wider">
                    Email
                  </span>
                  <span className="text-xs font-bold text-dark-black/90 mt-0.5 truncate">
                    {currentRep.email || "ryan.anderson@pitchprox.com"}
                  </span>
                </div>

                {/* Phone */}
                <div className="bg-[#F8FAFC] border border-light-gray rounded-xl px-4 py-2 flex flex-col">
                  <span className="text-[10px] font-medium text-light-black uppercase tracking-wider">
                    Phone
                  </span>
                  <span className="text-xs font-bold text-dark-black/90 mt-0.5">
                    {currentRep.phone || "(512) 555-0198"}
                  </span>
                </div>

                {/* Hire Date */}
                <div className="bg-[#F8FAFC] border border-light-gray rounded-xl px-4 py-2 flex flex-col">
                  <span className="text-[10px] font-medium text-light-black uppercase tracking-wider">
                    Hire Date
                  </span>
                  <span className="text-xs font-bold text-dark-black/90 mt-0.5">
                    {currentRep.hireDate || "Jan 10, 2024"}
                  </span>
                </div>

                {/* Time Zone */}
                <div className="bg-[#F8FAFC] border border-light-gray rounded-xl px-4 py-2 flex flex-col">
                  <span className="text-[10px] font-medium text-light-black uppercase tracking-wider">
                    Time Zone
                  </span>
                  <span className="text-xs font-bold text-dark-black/90 mt-0.5">
                    {currentRep.timeZone || "(GMT-05:00) Eastern Time"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Column 2: Session Options (4 cols) ── */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h4 className="text-[11px] font-bold text-dark-black/90 uppercase tracking-wider">
                SESSION OPTIONS
              </h4>

              {/* Session Duration */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-dark-black/85">
                  <span>Session Duration</span>
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-light-black inline-flex items-center justify-center text-[10px] font-semibold cursor-pointer">
                    ?
                  </span>
                </div>

                <div className="w-full">
                  <Dropdown
                    items={durationOptions}
                    selected={duration}
                    onSelect={(val) => setDuration(val)}
                    variant="default"
                    placement="bottom"
                    className="w-full"
                  />
                </div>

                <p className="text-[11px] text-light-black italic mt-0.5">
                  You will be automatically logged out when the session ends.
                </p>
              </div>

              {/* Access Level */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-dark-black/85">
                  <span>Access Level</span>
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-light-black inline-flex items-center justify-center text-[10px] font-semibold cursor-pointer">
                    ?
                  </span>
                </div>

                {/* Option 1: Full Access */}
                <div
                  onClick={() => setAccessLevel("full")}
                  className={`rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                    accessLevel === "full"
                      ? "border-2 border-primary bg-primary/5 shadow-2xs"
                      : "border border-light-gray bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        accessLevel === "full"
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-light-black"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark-black/90">
                        Full Access
                      </p>
                      <p className="text-[11px] text-light-black">
                        Access all features and data as this user
                      </p>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className="shrink-0 ml-2">
                    {accessLevel === "full" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </div>

                {/* Option 2: Read Only */}
                <div
                  onClick={() => setAccessLevel("readonly")}
                  className={`rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                    accessLevel === "readonly"
                      ? "border-2 border-primary bg-primary/5 shadow-2xs"
                      : "border border-light-gray bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        accessLevel === "readonly"
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-light-black"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark-black/90">
                        Read Only
                      </p>
                      <p className="text-[11px] text-light-black">
                        View data but cannot make any changes
                      </p>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className="shrink-0 ml-2">
                    {accessLevel === "readonly" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-dark-black/85">
                  <span>
                    Reason <span className="text-primary">(Required)</span>
                  </span>
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-light-black inline-flex items-center justify-center text-[10px] font-semibold cursor-pointer">
                    ?
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={reason}
                    maxLength={200}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide detailed justification for audit record..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                  <span className="absolute right-2.5 bottom-2 text-[10px] text-light-black">
                    {reason.length}/200
                  </span>
                </div>
              </div>

              {/* Checkbox Agreement */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="hidden"
                />
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    agreed
                      ? "bg-primary border-primary text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {agreed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs text-dark-black/80 font-normal leading-tight">
                  I understand that all actions will be logged and attributed to me as Admin.
                </span>
              </label>
            </div>

            {/* ── Column 3: What You Will See (4 cols) ── */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h4 className="text-[11px] font-bold text-dark-black/90 uppercase tracking-wider">
                WHAT YOU WILL SEE
              </h4>

              <div className="flex flex-col gap-2.5">
                {/* 1. Dashboard */}
                <div className="border border-light-gray rounded-xl p-3 flex items-center gap-3 bg-white hover:border-slate-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-black/90">
                      Dashboard
                    </p>
                    <p className="text-[11px] text-light-black">
                      User&apos;s dashboard and widgets
                    </p>
                  </div>
                </div>

                {/* 2. Calls */}
                <div className="border border-light-gray rounded-xl p-3 flex items-center gap-3 bg-white hover:border-slate-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-black/90">Calls</p>
                    <p className="text-[11px] text-light-black">
                      Call history and recordings
                    </p>
                  </div>
                </div>

                {/* 3. Leads */}
                <div className="border border-light-gray rounded-xl p-3 flex items-center gap-3 bg-white hover:border-slate-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-black/90">Leads</p>
                    <p className="text-[11px] text-light-black">
                      Leads assigned to this user
                    </p>
                  </div>
                </div>

                {/* 4. Reports */}
                <div className="border border-light-gray rounded-xl p-3 flex items-center gap-3 bg-white hover:border-slate-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-black/90">
                      Reports
                    </p>
                    <p className="text-[11px] text-light-black">
                      Reports and analytics
                    </p>
                  </div>
                </div>

                {/* 5. Settings */}
                <div className="border border-light-gray rounded-xl p-3 flex items-center gap-3 bg-white hover:border-slate-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-black/90">
                      Settings
                    </p>
                    <p className="text-[11px] text-light-black">
                      User&apos;s settings and preferences
                    </p>
                  </div>
                </div>

                {/* 6. Billing */}
                <div className="border border-light-gray rounded-xl p-3 flex items-center gap-3 bg-white hover:border-slate-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-black/90">
                      Billing
                    </p>
                    <p className="text-[11px] text-light-black">
                      Billing information and invoices
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-light-black italic mt-0.5">
                * Based on user permissions
              </p>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="pt-4 border-t border-light-gray flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Security Notice */}
            <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
              <span>
                Security Notice: Do not share sensitive information while impersonating. Be sure to log out when you are finished.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartImpersonation}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Impersonation"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Phone,
  FileText,
  Zap,
  HardDrive,
  RotateCcw,
  User,
  Settings,
  CheckCircle,
  Shield,
  Globe,
  Laptop,
  Smartphone,
  X,
  Sliders,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AuditInfo from "./audit-info";
import ChangePlanModal from "./change-plan-modal";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Pagination from "@/components/shared/pagination/pagination";

// ── Activity Timeline Data ──
const INITIAL_ACTIVITIES = [
  {
    id: "act-1",
    type: "calls",
    title: "Made a call to +1 (512) 555-0198",
    subtitle: "Lead Type: Expired Listing",
    time: "Just now",
    icon: Phone,
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    id: "act-2",
    type: "reports",
    title: "Generated Call Analysis Report",
    subtitle: "Call with +1 (512) 555-0198",
    time: "12m ago",
    icon: FileText,
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "act-3",
    type: "calibrations",
    title: "Completed Calibration Session",
    subtitle: "Real Estate Expireds v2.1",
    time: "34m ago",
    icon: CheckCircle,
    iconColor: "text-teal-600 bg-teal-50 border-teal-100",
  },
  {
    id: "act-4",
    type: "logins",
    title: "User logged in",
    subtitle: "Chrome on macOS • 98.114.22.15",
    time: "47m ago",
    icon: User,
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    id: "act-5",
    type: "settings",
    title: "Updated Account Settings",
    subtitle: "Notification preferences changed",
    time: "1h ago",
    icon: Settings,
    iconColor: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    id: "act-6",
    type: "calls",
    title: "Made a call to +1 (512) 555-0144",
    subtitle: "Lead Type: FSBO",
    time: "2h ago",
    icon: Phone,
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    id: "act-7",
    type: "reports",
    title: "Generated Call Analysis Report",
    subtitle: "Call with +1 (512) 555-0144",
    time: "2h ago",
    icon: FileText,
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "act-8",
    type: "calls",
    title: "Made a call to +1 (512) 555-0177",
    subtitle: "Lead Type: Pre-Expired",
    time: "5h ago",
    icon: Phone,
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    id: "act-9",
    type: "storage",
    title: "Uploaded Call Audio Recording",
    subtitle: "18.4 MB • audio/mp3 format",
    time: "7h ago",
    icon: HardDrive,
    iconColor: "text-orange-600 bg-orange-50 border-orange-100",
  },
  {
    id: "act-10",
    type: "logins",
    title: "User logged in",
    subtitle: "Safari on iOS • 73.209.87.44",
    time: "1d ago",
    icon: User,
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    id: "act-11",
    type: "settings",
    title: "Added 250 Call Credits",
    subtitle: "Manual adjustment by Daniel Miller",
    time: "1d ago",
    icon: Settings,
    iconColor: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    id: "act-12",
    type: "reports",
    title: "Generated Performance Summary Report",
    subtitle: "Monthly analytics breakdown",
    time: "2d ago",
    icon: FileText,
    iconColor: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    id: "act-13",
    type: "calibrations",
    title: "Completed Calibration Session",
    subtitle: "Outbound Cold Calling v1.4",
    time: "2d ago",
    icon: CheckCircle,
    iconColor: "text-teal-600 bg-teal-50 border-teal-100",
  },
  {
    id: "act-14",
    type: "settings",
    title: "Updated Billing Information",
    subtitle: "Credit card ending in 4242 updated",
    time: "3d ago",
    icon: Settings,
    iconColor: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    id: "act-15",
    type: "logins",
    title: "User logged in",
    subtitle: "Chrome on Windows • 98.114.22.15",
    time: "3d ago",
    icon: User,
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
  },
];

// ── Login Activity Data ──
const LOGIN_ACTIVITIES = [
  {
    id: "log-1",
    date: "May 16, 10:01 AM",
    ip: "98.114.22.15",
    location: "Austin, TX",
    device: "Chrome",
    browser: "Chrome on macOS",
  },
  {
    id: "log-2",
    date: "May 16, 8:42 AM",
    ip: "98.114.22.15",
    location: "Austin, TX",
    device: "Chrome",
    browser: "Chrome on macOS",
  },
  {
    id: "log-3",
    date: "May 15, 7:19 PM",
    ip: "73.209.87.44",
    location: "Dallas, TX",
    device: "Safari",
    browser: "Safari on iOS",
  },
  {
    id: "log-4",
    date: "May 15, 2:10 PM",
    ip: "98.114.22.15",
    location: "Austin, TX",
    device: "Chrome",
    browser: "Chrome on macOS",
  },
  {
    id: "log-5",
    date: "May 14, 9:15 AM",
    ip: "98.114.22.15",
    location: "Austin, TX",
    device: "Firefox",
    browser: "Firefox on Windows",
  },
  {
    id: "log-6",
    date: "May 13, 4:30 PM",
    ip: "104.28.19.45",
    location: "Houston, TX",
    device: "Edge",
    browser: "Edge on Windows",
  },
  {
    id: "log-7",
    date: "May 12, 11:22 AM",
    ip: "98.114.22.15",
    location: "Austin, TX",
    device: "Chrome",
    browser: "Chrome on macOS",
  },
  {
    id: "log-8",
    date: "May 11, 8:05 AM",
    ip: "98.114.22.15",
    location: "Austin, TX",
    device: "Safari",
    browser: "Safari on macOS",
  },
];

const ACTIVITY_FILTER_OPTIONS = [
  { value: "all", label: "All Activities" },
  { value: "calls", label: "Calls" },
  { value: "reports", label: "Reports" },
  { value: "calibrations", label: "Calibrations" },
  { value: "logins", label: "Logins" },
  { value: "settings", label: "Account Settings" },
];

export default function UserUsageActivity({ onBack }) {
  // Usage Counts State
  const usageItems = [
    {
      id: "calls",
      label: "Calls",
      icon: Phone,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 border-blue-100",
      barColor: "bg-blue-500",
      used: "142",
      total: "500",
      percent: 28,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50 border-purple-100",
      barColor: "bg-purple-500",
      used: "18",
      total: "50",
      percent: 36,
    },
    {
      id: "calibrations",
      label: "Calibrations",
      icon: Zap,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 border-emerald-100",
      barColor: "bg-emerald-500",
      used: "2",
      total: "5",
      percent: 40,
    },
    {
      id: "storage",
      label: "Storage",
      icon: HardDrive,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50 border-orange-100",
      barColor: "bg-orange-500",
      used: "1.2 GB",
      total: "5 GB",
      percent: 24,
    },
  ];

  // User details for modal
  const [userData, setUserData] = useState({
    name: "Jennifer Smith",
    company: "Acme Inc.",
    plan: "Premium Plan",
    currentPlan: "Premium",
    price: "$499.00",
    currentPrice: 499,
    initials: "JS",
    currentExpiration: "June 15, 2025",
    daysRemaining: 30,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
  });

  // Filter & Pagination for Activity Log
  const [activityFilter, setActivityFilter] = useState("all");
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(5);

  // Modals
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);

  // Filtered activities
  const filteredActivities = INITIAL_ACTIVITIES.filter((item) => {
    if (activityFilter === "all") return true;
    return item.type === activityFilter;
  });

  const startIndex = (activityPage - 1) * activityPageSize;
  const currentActivities = filteredActivities.slice(startIndex, startIndex + activityPageSize);

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 pb-6">
      {/* ── Main 2-Column Responsive Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN: Usage Overview & Activity Log (7 cols)       */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-7 flex flex-col gap-6 w-full min-w-0">
          {/* ── 1. USAGE OVERVIEW (THIS CYCLE) CARD ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-dark-black/85">
                  Usage Overview
                </h2>
                <div className="inline-flex items-center gap-1 text-xs text-light-black font-normal">
                  <span>(This Cycle)</span>
                  <RotateCcw className="w-3.5 h-3.5 text-light-black/60" />
                </div>
              </div>
            </div>

            {/* 4 Usage Progress Rows - Responsive & Perfectly Aligned Grid */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {usageItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 p-3 sm:p-3.5 rounded-xl bg-light-gray/20 border border-light-gray/60 hover:bg-light-gray/30 transition-colors"
                  >
                    {/* Top Row on Mobile: Icon, Label & Numbers */}
                    <div className="flex items-center justify-between sm:w-32 shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl border shrink-0 ${item.iconBg} ${item.iconColor}`}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-dark-black/85">
                          {item.label}
                        </span>
                      </div>

                      {/* Mobile Numbers */}
                      <div className="sm:hidden text-right">
                        <span className="text-xs font-bold text-dark-black/85 font-secondary">
                          {item.used}
                        </span>
                        <span className="text-xs text-light-black font-normal">
                          {" "}/ {item.total}
                        </span>
                        <span className="text-[10px] text-light-black font-normal ml-1">
                          ({item.percent}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 w-full min-w-0">
                      <div className="w-full bg-light-gray/80 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Desktop Aligned Right Numbers / Stats */}
                    <div className="hidden sm:block w-36 text-right shrink-0">
                      <span className="text-xs font-bold text-dark-black/85 font-secondary">
                        {item.used}
                      </span>
                      <span className="text-xs text-light-black font-normal">
                        {" "}/ {item.total}
                      </span>
                      <span className="text-[11px] text-light-black font-normal ml-1.5">
                        {item.percent}% used
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cycle Period Footer */}
            <div className="pt-2 border-t border-light-gray/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <span className="text-light-black font-medium">
                Cycle Period:{" "}
                <span className="text-dark-black/85 font-semibold">
                  May 16, 2025 - Jun 15, 2025
                </span>{" "}
                <span className="text-light-black">(30 days left)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsLimitsModalOpen(true)}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                View Usage Limits
              </button>
            </div>
          </div>

          {/* ── 2. ACTIVITY LOG (WITH PAGINATION) CARD ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden flex flex-col">
            {/* Header with Filter Dropdown */}
            <div className="p-5 sm:p-6 pb-4 border-b border-light-gray/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-dark-black/85">
                  Activity Timeline
                </h3>
                <p className="text-xs text-light-black mt-0.5">
                  Real-time events and user actions recorded for this cycle
                </p>
              </div>

              <div className="w-full sm:w-auto">
                <Dropdown
                  label="All Activities"
                  items={ACTIVITY_FILTER_OPTIONS}
                  selected={activityFilter}
                  onSelect={(val) => {
                    setActivityFilter(val);
                    setActivityPage(1);
                  }}
                  variant="small"
                  className="w-full sm:w-[170px]"
                  buttonClassName="h-9 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Activities List */}
            <div className="p-5 sm:p-6 flex flex-col gap-4 divide-y divide-light-gray/60">
              {currentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-light-black">
                  No activities found for the selected filter.
                </div>
              ) : (
                currentActivities.map((act, index) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      className={`flex items-start justify-between gap-3 ${
                        index !== 0 ? "pt-4" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`p-2 rounded-xl border shrink-0 ${act.iconColor}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-semibold text-dark-black/85">
                            {act.title}
                          </span>
                          <span className="text-[11px] text-light-black font-normal mt-0.5">
                            {act.subtitle}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-medium text-light-black whitespace-nowrap shrink-0">
                        {act.time}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Activity Log Pagination */}
            {filteredActivities.length > 0 && (
              <Pagination
                currentPage={activityPage}
                totalItems={filteredActivities.length}
                pageSize={activityPageSize}
                onPageChange={setActivityPage}
                onPageSizeChange={(size) => {
                  setActivityPageSize(size);
                  setActivityPage(1);
                }}
                itemLabel="activities"
                pageSizeOptions={[
                  { value: "5 / page", label: "5 / page" },
                  { value: "10 / page", label: "10 / page" },
                  { value: "15 / page", label: "15 / page" },
                ]}
              />
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: Login Activity (5 cols)                      */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-5 flex flex-col gap-6 w-full min-w-0">
          {/* ── 3. LOGIN ACTIVITY CARD (No View All button) ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-light-gray/70">
              <h3 className="text-base font-bold text-dark-black/85">
                Login Activity
              </h3>
              <p className="text-xs text-light-black mt-0.5">
                Recent authentication sessions and devices used
              </p>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto min-w-0 overscroll-x-contain touch-pan-x">
              <table className="w-full min-w-[340px] text-left text-xs border-collapse">
                <thead className="bg-light-gray/30 border-b border-light-gray/70 text-[10px] font-bold uppercase tracking-wider text-light-black">
                  <tr>
                    <th className="py-3 px-4 sm:px-5">DATE & TIME</th>
                    <th className="py-3 px-3">LOCATION</th>
                    <th className="py-3 px-4 sm:px-5 text-right">DEVICE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/60">
                  {LOGIN_ACTIVITIES.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-light-gray/20 transition-colors"
                    >
                      {/* Date & Time with IP */}
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-dark-black/85">
                            {log.date}
                          </span>
                          <span className="text-[11px] text-light-black font-mono mt-0.5">
                            {log.ip}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-medium-black font-medium">
                          <Globe className="w-3.5 h-3.5 text-light-black/70 shrink-0" />
                          <span>{log.location}</span>
                        </div>
                      </td>

                      {/* Device */}
                      <td className="py-3 px-4 sm:px-5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-dark-black/80 bg-light-gray/50 px-2.5 py-1 rounded-lg border border-light-gray">
                          {log.device === "Safari" ? (
                            <Smartphone className="w-3 h-3 text-light-black shrink-0" />
                          ) : (
                            <Laptop className="w-3 h-3 text-light-black shrink-0" />
                          )}
                          <span>{log.device}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* BOTTOM SECTION: Reset Notice & Upgrade CTA                   */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-800">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="leading-relaxed">
            Usage resets on Jun 15, 2025 at 12:00 AM (GMT-05:00). Add credits or upgrade plan to increase limits.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsChangePlanModalOpen(true)}
          className="px-4 py-2 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
        >
          Upgrade Plan
        </button>
      </div>

      {/* ── Footer Audit Info ── */}
      <AuditInfo />

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                       */}
      {/* ═════════════════════════════════════════════════════════════ */}

      {/* 1. Change / Upgrade Plan Modal */}
      <ChangePlanModal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        user={userData}
        onConfirm={(planData) => {
          if (planData?.name) {
            setUserData((prev) => ({
              ...prev,
              plan: `${planData.name} Plan`,
              currentPlan: planData.name,
              currentPrice: planData.price,
            }));
            toast.success(`Plan updated to ${planData.name}!`);
          }
        }}
      />

      {/* 2. Usage Limits Info Modal */}
      <AnimatePresence>
        {isLimitsModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setIsLimitsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8"
            >
              <div className="p-6 pb-4 border-b border-light-gray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-50 text-primary border border-teal-100">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-black/85">
                      Plan Limits & Quotas
                    </h3>
                    <p className="text-xs text-light-black">
                      Premium Plan base allocations and burst allowances
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLimitsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="divide-y divide-light-gray">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-light-black font-medium">Included Calls</span>
                    <span className="font-bold text-dark-black/85">500 calls / month</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-light-black font-medium">Included AI Reports</span>
                    <span className="font-bold text-dark-black/85">50 reports / month</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-light-black font-medium">Voice Calibrations</span>
                    <span className="font-bold text-dark-black/85">5 calibrations</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-light-black font-medium">Audio Storage</span>
                    <span className="font-bold text-dark-black/85">5.0 GB</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-light-black font-medium">Overage Rate (Calls)</span>
                    <span className="font-bold text-dark-black/85">$0.08 / call</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-light-black font-medium">Overage Rate (Reports)</span>
                    <span className="font-bold text-dark-black/85">$5.00 / report</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:px-6 border-t border-light-gray bg-light-gray/20 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsLimitsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

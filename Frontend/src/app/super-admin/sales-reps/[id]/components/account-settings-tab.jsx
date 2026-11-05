"use client";

import React, { useState } from "react";
import { UserX, Lock, Check } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const managerOptions = [
  { value: "Daniel Martine", label: "Daniel Martine" },
  { value: "Sarah Johnson", label: "Sarah Johnson" },
  { value: "Emily Smith", label: "Emily Smith" },
  { value: "Michael Brown", label: "Michael Brown" },
];

const timeZoneOptions = [
  { value: "(GMT-05:00) Eastern Time", label: "(GMT-05:00) Eastern Time" },
  { value: "(GMT-06:00) Central Time", label: "(GMT-06:00) Central Time" },
  { value: "(GMT-07:00) Mountain Time", label: "(GMT-07:00) Mountain Time" },
  { value: "(GMT-08:00) Pacific Time", label: "(GMT-08:00) Pacific Time" },
];

const languageOptions = [
  { value: "English (US)", label: "English (US)" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
];

const dateFormatOptions = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const landingPageOptions = [
  { value: "Dashboard", label: "Dashboard" },
  { value: "Live Calling", label: "Live Calling" },
  { value: "Performance", label: "Performance" },
  { value: "Reports", label: "Reports" },
];

const scriptViewOptions = [
  { value: "AI Prompts", label: "AI Prompts" },
  { value: "Full Playbook", label: "Full Playbook" },
  { value: "Compact Cue Cards", label: "Compact Cue Cards" },
];

const timeoutOptions = [
  { value: "15 minutes", label: "15 minutes" },
  { value: "30 minutes", label: "30 minutes" },
  { value: "1 hour", label: "1 hour" },
  { value: "2 hours", label: "2 hours" },
];

const platformAccessOptions = [
  { value: "Full Access", label: "Full Access" },
  { value: "Restricted Closer", label: "Restricted Closer" },
  { value: "Read Only", label: "Read Only" },
];

const reportsAccessOptions = [
  { value: "All Reports", label: "All Reports" },
  { value: "Team Reports Only", label: "Team Reports Only" },
  { value: "Own Reports Only", label: "Own Reports Only" },
];

const coachingAccessOptions = [
  { value: "Own Notes Only", label: "Own Notes Only" },
  { value: "Team Notes", label: "Team Notes" },
  { value: "Full Access", label: "Full Access" },
];

export default function AccountSettingsTab({ rep }) {
  const repName = rep?.name || "Ryan Anderson";

  // Account Information State
  const [fullName, setFullName] = useState(repName);
  const [manager, setManager] = useState("Daniel Martine");
  const [employeeId, setEmployeeId] = useState(rep?.employeeId || "EMP-1001");
  const [workEmail, setWorkEmail] = useState(
    rep?.email || "ryan.anderson@pitchprox.com"
  );
  const [phoneNumber, setPhoneNumber] = useState(
    rep?.phone || "(512) 555-0198"
  );
  const [timeZone, setTimeZone] = useState("(GMT-05:00) Eastern Time");
  const [language, setLanguage] = useState("English (US)");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  // Preferences & System Settings State
  const [landingPage, setLandingPage] = useState("Dashboard");
  const [scriptView, setScriptView] = useState("AI Prompts");
  const [aiRealtimeGuidance, setAiRealtimeGuidance] = useState(true);
  const [postCallAnalysis, setPostCallAnalysis] = useState(true);
  const [lowTrustThreshold, setLowTrustThreshold] = useState("-10");
  const [promptAdherenceAlert, setPromptAdherenceAlert] = useState("75");
  const [sessionTimeout, setSessionTimeout] = useState("30 minutes");

  // Access & Permissions State
  const [platformAccess, setPlatformAccess] = useState("Full Access");
  const [reportsAccess, setReportsAccess] = useState("All Reports");
  const [coachingAccess, setCoachingAccess] = useState("Own Notes Only");
  const [exportData, setExportData] = useState(true);
  const [managePlaybooks, setManagePlaybooks] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleSaveAll = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Account settings updated successfully!");
    }, 450);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-light-gray shadow-xs flex flex-col gap-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight">
          Account Settings
        </h2>
        <p className="text-xs sm:text-sm text-light-black mt-0.5">
          Manage {repName}&apos;s account preferences, access, and system configurations.
        </p>
      </div>

      {/* 3 Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Column 1: Account Information ── */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold text-dark-black/90 font-secondary tracking-tight pb-1">
            Account Information
          </span>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
              FULL NAME
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Manager */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
              MANAGER
            </label>
            <Dropdown
              items={managerOptions}
              selected={manager}
              onSelect={(val) => setManager(val)}
              variant="default"
              placement="bottom"
              className="w-full"
            />
          </div>

          {/* Employee ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
              EMPLOYEE ID
            </label>
            <input
              type="text"
              disabled
              value={employeeId}
              className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/70 bg-slate-50/80 cursor-not-allowed"
            />
          </div>

          {/* Work Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
              WORK EMAIL
            </label>
            <input
              type="email"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
              PHONE NUMBER
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Time Zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
              TIME ZONE
            </label>
            <Dropdown
              items={timeZoneOptions}
              selected={timeZone}
              onSelect={(val) => setTimeZone(val)}
              variant="default"
              placement="bottom"
              className="w-full"
            />
          </div>

          {/* Language & Date Format Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
                LANGUAGE
              </label>
              <Dropdown
                items={languageOptions}
                selected={language}
                onSelect={(val) => setLanguage(val)}
                variant="default"
                placement="bottom"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
                DATE FORMAT
              </label>
              <Dropdown
                items={dateFormatOptions}
                selected={dateFormat}
                onSelect={(val) => setDateFormat(val)}
                variant="default"
                placement="bottom"
                className="w-full"
              />
            </div>
          </div>

          {/* Password with Change Password Button */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-[10.5px] font-bold text-light-black uppercase tracking-wider">
              PASSWORD
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                disabled
                value="••••••••••••••••"
                className="flex-1 px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/70 bg-slate-50/80"
              />
              <button
                type="button"
                onClick={() => toast.success("Password reset email sent to " + workEmail)}
                className="px-3 py-2.5 rounded-xl border border-teal-600 text-teal-600 hover:bg-teal-50 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* ── Column 2: Preferences & System Settings ── */}
        <div className="flex flex-col gap-5">
          <span className="text-xs font-bold text-dark-black/90 font-secondary tracking-tight pb-1">
            Preferences & System Settings
          </span>

          {/* Default Landing Page */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-dark-black/90">Default Landing Page</p>
                <p className="text-[11px] text-light-black">Page shown after login</p>
              </div>
              <div className="w-36 shrink-0">
                <Dropdown
                  items={landingPageOptions}
                  selected={landingPage}
                  onSelect={(val) => setLandingPage(val)}
                  variant="small"
                  placement="bottom"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Default Call Script View */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-dark-black/90">Default Call Script View</p>
                <p className="text-[11px] text-light-black">Preferred view during live calls</p>
              </div>
              <div className="w-36 shrink-0">
                <Dropdown
                  items={scriptViewOptions}
                  selected={scriptView}
                  onSelect={(val) => setScriptView(val)}
                  variant="small"
                  placement="bottom"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* AI Real-time Guidance Toggle */}
          <div className="flex items-center justify-between gap-2 py-1">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">AI Real-time Guidance</p>
              <p className="text-[11px] text-light-black">Show AI prompts during calls</p>
            </div>
            <button
              type="button"
              onClick={() => setAiRealtimeGuidance(!aiRealtimeGuidance)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                aiRealtimeGuidance ? "bg-teal-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  aiRealtimeGuidance ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Post Call Analysis Toggle */}
          <div className="flex items-center justify-between gap-2 py-1">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Post Call Analysis</p>
              <p className="text-[11px] text-light-black">Generate analysis after each call</p>
            </div>
            <button
              type="button"
              onClick={() => setPostCallAnalysis(!postCallAnalysis)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                postCallAnalysis ? "bg-teal-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  postCallAnalysis ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Low Trust Alert Threshold */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Low Trust Alert Threshold</p>
              <p className="text-[11px] text-light-black">Alert when trust gain is below</p>
            </div>
            <div className="w-24 shrink-0">
              <input
                type="text"
                value={lowTrustThreshold}
                onChange={(e) => setLowTrustThreshold(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-light-gray text-xs text-right text-dark-black font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Prompt Adherence Alert */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Prompt Adherence Alert</p>
              <p className="text-[11px] text-light-black">Alert when adherence is below</p>
            </div>
            <div className="w-24 shrink-0 flex items-center gap-1">
              <input
                type="text"
                value={promptAdherenceAlert}
                onChange={(e) => setPromptAdherenceAlert(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-light-gray text-xs text-right text-dark-black font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <span className="text-xs text-light-black font-semibold">%</span>
            </div>
          </div>

          {/* Session Timeout */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Session Timeout</p>
              <p className="text-[11px] text-light-black">Auto logout after inactivity</p>
            </div>
            <div className="w-32 shrink-0">
              <Dropdown
                items={timeoutOptions}
                selected={sessionTimeout}
                onSelect={(val) => setSessionTimeout(val)}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* ── Column 3: Access & Permissions ── */}
        <div className="flex flex-col gap-5">
          <span className="text-xs font-bold text-dark-black/90 font-secondary tracking-tight pb-1">
            Access & Permissions
          </span>

          {/* Platform Access */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Platform Access</p>
              <p className="text-[11px] text-light-black">Overall platform access level</p>
            </div>
            <div className="w-36 shrink-0">
              <Dropdown
                items={platformAccessOptions}
                selected={platformAccess}
                onSelect={(val) => setPlatformAccess(val)}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>
          </div>

          {/* Reports Access */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Reports Access</p>
              <p className="text-[11px] text-light-black">Access to reports and analytics</p>
            </div>
            <div className="w-36 shrink-0">
              <Dropdown
                items={reportsAccessOptions}
                selected={reportsAccess}
                onSelect={(val) => setReportsAccess(val)}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>
          </div>

          {/* Coaching Notes Access */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Coaching Notes Access</p>
              <p className="text-[11px] text-light-black">View coaching notes and feedback</p>
            </div>
            <div className="w-36 shrink-0">
              <Dropdown
                items={coachingAccessOptions}
                selected={coachingAccess}
                onSelect={(val) => setCoachingAccess(val)}
                variant="small"
                placement="bottom"
                className="w-full"
              />
            </div>
          </div>

          {/* Export Data Toggle */}
          <div className="flex items-center justify-between gap-2 py-1">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Export Data</p>
              <p className="text-[11px] text-light-black">Allow data export</p>
            </div>
            <button
              type="button"
              onClick={() => setExportData(!exportData)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                exportData ? "bg-teal-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  exportData ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Manage Playbooks Toggle */}
          <div className="flex items-center justify-between gap-2 py-1">
            <div>
              <p className="text-xs font-semibold text-dark-black/90">Manage Playbooks</p>
              <p className="text-[11px] text-light-black">Create and edit playbooks</p>
            </div>
            <button
              type="button"
              onClick={() => setManagePlaybooks(!managePlaybooks)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                managePlaybooks ? "bg-teal-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  managePlaybooks ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Save Changes CTA Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {saving ? "Saving Preferences..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer info & Suspend Rep button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-light-gray">
        <p className="text-xs text-light-black">
          Joined: <strong>Jan 12, 2024</strong> • Time Zone:{" "}
          <strong>(GMT-05:00) Eastern Time (US & Canada)</strong>
        </p>

        <button
          type="button"
          onClick={() =>
            toast.error("Confirming rep suspension status...", { icon: "⚠️" })
          }
          className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 w-fit"
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Suspend Rep</span>
        </button>
      </div>
    </div>
  );
}

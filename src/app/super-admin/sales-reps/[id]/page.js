"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

import RepProfileHeader from "./components/rep-profile-header";
import RepKpiStats from "./components/rep-kpi-stats";
import RepMetricCards from "./components/rep-metric-cards";
import RepNavTabs from "./components/rep-nav-tabs";
import MonthlyPerformanceChart from "./components/monthly-performance-chart";
import RecentCallHighlights from "./components/recent-call-highlights";
import AiCoachingInsights from "./components/ai-coaching-insights";
import CalibrationScoreCard from "./components/calibration-score-card";
import ManagerNotesCard from "./components/manager-notes-card";
import EditRepModal from "./components/edit-rep-modal";
import AddManagerNoteModal from "./components/add-manager-note-modal";
import ImpersonateRepModal from "./components/impersonate-rep-modal";
import PerformanceTab from "./components/performance-tab";
import CallsTab from "./components/calls-tab";
import ReportsTab from "./components/reports-tab";
import CoachingNotesTab from "./components/coaching-notes-tab";
import CalibrationTab from "./components/calibration-tab";
import AccountSettingsTab from "./components/account-settings-tab";
import ActivityLogTab from "./components/activity-log-tab";

const repsProfiles = {
  "EMP-1001": {
    id: "EMP-1001",
    name: "Ryan Anderson",
    role: "Senior Closer",
    status: "Active",
    email: "ryan.anderson@pitchprox.com",
    phone: "(512) 555-0198",
    employeeId: "EMP-1001",
    manager: "Sarah Johnson",
    hireDate: "Jan 10, 2024",
    timeZone: "(GMT-05:00) Eastern Time",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160",
    totalCalls: "128",
    subscriptionsClosed: "56",
    leadToSub: "34.2%",
    trustGain: "+28.7",
    promptAdh: "92.1%",
    avgCallDuration: "14m 32s",
    convMomentum: "+18.6%",
    currentStreak: "7",
    tier: "Elite",
    calibrationScore: 94,
    lastActive: "Today, 10:32 AM",
  },
  "EMP-1002": {
    id: "EMP-1002",
    name: "David Martinez",
    role: "Closer",
    status: "Active",
    email: "david.martinez@pitchprox.com",
    phone: "(512) 555-0198",
    employeeId: "EMP-1002",
    manager: "Emily Smith",
    hireDate: "Feb 15, 2024",
    timeZone: "(GMT-06:00) Central Time",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160",
    totalCalls: "114",
    subscriptionsClosed: "47",
    leadToSub: "29.8%",
    trustGain: "+22.4",
    promptAdh: "89.4%",
    avgCallDuration: "13m 15s",
    convMomentum: "+15.2%",
    currentStreak: "5",
    tier: "Strong",
    calibrationScore: 90,
    lastActive: "Today, 9:15 AM",
  },
  "EMP-1003": {
    id: "EMP-1003",
    name: "Michael Carter",
    role: "Closing Specialist",
    status: "Active",
    email: "michael.carter@pitchprox.com",
    phone: "(512) 555-0211",
    employeeId: "EMP-1003",
    manager: "Michael Brown",
    hireDate: "Mar 01, 2024",
    timeZone: "(GMT-05:00) Eastern Time",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160",
    totalCalls: "98",
    subscriptionsClosed: "39",
    leadToSub: "25.7%",
    trustGain: "+19.3",
    promptAdh: "84.7%",
    avgCallDuration: "12m 45s",
    convMomentum: "+12.8%",
    currentStreak: "4",
    tier: "Strong",
    calibrationScore: 86,
    lastActive: "Today, 8:47 AM",
  },
  "EMP-1004": {
    id: "EMP-1004",
    name: "Emily Davis",
    role: "Closer",
    status: "Offline",
    email: "emily.davis@pitchprox.com",
    phone: "(512) 555-0245",
    employeeId: "EMP-1004",
    manager: "Sarah Davis",
    hireDate: "Apr 12, 2024",
    timeZone: "(GMT-08:00) Pacific Time",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160",
    totalCalls: "85",
    subscriptionsClosed: "31",
    leadToSub: "22.1%",
    trustGain: "+16.8",
    promptAdh: "78.2%",
    avgCallDuration: "11m 20s",
    convMomentum: "+8.4%",
    currentStreak: "2",
    tier: "Developing",
    calibrationScore: 80,
    lastActive: "Yesterday, 4:32 PM",
  },
};

export default function SalesRepDetailPage() {
  const params = useParams();
  const id = params?.id ? decodeURIComponent(params.id) : "EMP-1001";

  const [repData, setRepData] = useState(
    repsProfiles[id] || repsProfiles["EMP-1001"]
  );
  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [impersonateModalOpen, setImpersonateModalOpen] = useState(false);

  const handleUpdateProfile = (updated) => {
    setRepData((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-12">
      {/* ── 1. Rep Profile Header Card ── */}
      <RepProfileHeader
        rep={repData}
        onEditProfile={() => setEditModalOpen(true)}
        onImpersonate={() => setImpersonateModalOpen(true)}
      />

      {/* ── 2. Top Primary 4 KPI Stat Cards ── */}
      <RepKpiStats rep={repData} />

      {/* ── 3. Secondary 6 Metric & Status Cards ── */}
      <RepMetricCards rep={repData} />

      {/* ── 4. Profile Navigation Tabs ── */}
      <RepNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── 5. Main Tab Content ── */}
      {activeTab === "overview" && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
          {/* Left Column (8 cols): Monthly Performance Chart & Recent Call Highlights Table */}
          <div className="w-full min-w-0 lg:col-span-8 flex flex-col gap-6">
            {/* Monthly Performance Composed Chart & Quota Circular Gauge */}
            <MonthlyPerformanceChart rep={repData} />

            {/* Recent Call Highlights Table */}
            <RecentCallHighlights
              onViewAllCalls={() => setActiveTab("calls")}
            />
          </div>

          {/* Right Column (4 cols): AI Coaching Insights, Calibration Score, Manager Notes */}
          <div className="w-full min-w-0 lg:col-span-4 flex flex-col gap-6">
            {/* Widget 1: AI Coaching Insights */}
            <AiCoachingInsights />

            {/* Widget 2: Calibration Score Card */}
            <CalibrationScoreCard rep={repData} />

            {/* Widget 3: Manager Notes (Private) */}
            <ManagerNotesCard onAddNote={() => setAddNoteModalOpen(true)} />
          </div>
        </div>
      )}

      {activeTab === "performance" && <PerformanceTab rep={repData} />}

      {activeTab === "calls" && <CallsTab rep={repData} />}

      {activeTab === "reports" && (
        <ReportsTab rep={repData} onTabChange={setActiveTab} />
      )}

      {activeTab === "coaching-notes" && (
        <CoachingNotesTab rep={repData} />
      )}

      {activeTab === "calibration" && (
        <CalibrationTab rep={repData} />
      )}

      {activeTab === "account-settings" && (
        <AccountSettingsTab rep={repData} />
      )}

      {activeTab === "activity-log" && (
        <ActivityLogTab rep={repData} />
      )}

      {/* ── Interactive Modals ── */}
      <EditRepModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        rep={repData}
        onSave={handleUpdateProfile}
      />

      <AddManagerNoteModal
        isOpen={addNoteModalOpen}
        onClose={() => setAddNoteModalOpen(false)}
        repName={repData.name}
        onAdd={(note) => {
          toast.success("Manager note added to rep profile history!");
        }}
      />

      <ImpersonateRepModal
        isOpen={impersonateModalOpen}
        onClose={() => setImpersonateModalOpen(false)}
        rep={repData}
      />
    </div>
  );
}

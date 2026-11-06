"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import RepProfileHeader from "./components/rep-profile-header";
import RepKpiStats from "./components/rep-kpi-stats";
import RepMetricCards from "./components/rep-metric-cards";
import RepNavTabs from "./components/rep-nav-tabs";
import MonthlyPerformanceChart from "./components/monthly-performance-chart";
import CalibrationScoreCard from "./components/calibration-score-card";
import ManagerNotesCard from "./components/manager-notes-card";
import EditRepModal from "./components/edit-rep-modal";
import AddManagerNoteModal from "./components/add-manager-note-modal";
import CoachingNotesTab from "./components/coaching-notes-tab";
import AccountSettingsTab from "./components/account-settings-tab";
import ActivityLogTab from "./components/activity-log-tab";
import CalibrationSessions from "./components/calibration-sessions";
import WaitingPanel from "./components/waiting-panel";
import { DeactivateRepModal } from "../components/sales-rep-modals";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";
import { addRepNote, loadRep, updateRep } from "../team-api";

// Live rep profile (lib/sales-team → getRepDetail). Super Admin and Admin Manager edit; Support views.
// Call-based sections (calls, call reports, AI insights, performance scores) wait for calling (phase 7).
export default function SalesRepDetailPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id);

  const [detail, setDetail] = useState(null);
  const [failed, setFailed] = useState(null);
  const [managers, setManagers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [dialog, setDialog] = useState(null);

  const reload = useCallback(
    () =>
      loadRep(id)
        .then((data) => {
          setDetail(data);
          setFailed(null);
        })
        .catch((error) => setFailed(error.message)),
    [id]
  );
  useEffect(() => {
    reload();
    apiRequest("/api/v1/admin/managers").then((data) => setManagers(data.results)).catch(() => {});
  }, [reload]);

  if (!detail) {
    return <div className="w-full py-20 text-center text-sm text-light-black">{failed ?? "Loading rep profile…"}</div>;
  }

  const { rep, permissions } = detail;
  const canManage = permissions.canManage;
  const deactivate = async () => {
    try {
      await updateRep(rep.id, { status: "deactivated" });
      showSavedToast("Rep deactivated", `${rep.name} was signed out and removed from quota tracking.`);
      reload();
    } catch (error) {
      showError("Couldn't deactivate the rep", error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-12">
      <RepProfileHeader rep={rep} onEditProfile={canManage ? () => setDialog("edit") : undefined} />
      <RepKpiStats rep={rep} />
      <RepMetricCards rep={rep} goals={detail.goals} />
      <RepNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
          <div className="w-full min-w-0 lg:col-span-8 flex flex-col gap-6">
            <MonthlyPerformanceChart rep={rep} daily={detail.daily} monthLabel={detail.monthLabel} />
            <WaitingPanel title="Recent Call Highlights" compact />
          </div>
          <div className="w-full min-w-0 lg:col-span-4 flex flex-col gap-6">
            <WaitingPanel title="AI Coaching Insights" message="Insights are generated from call analysis once calling and the AI provider are connected. Coaching notes are live in the Coaching Notes tab." compact />
            <CalibrationScoreCard calibration={detail.calibration} onViewDetails={() => setActiveTab("calibration")} />
            {permissions.canSeeManagerNotes && <ManagerNotesCard notes={detail.managerNotes} onAddNote={() => setDialog("note")} />}
          </div>
        </div>
      )}

      {activeTab === "performance" && <WaitingPanel title="Performance scores" message="Prompt adherence, trust gain and score breakdowns are measured on calls. They appear once calling and the AI provider are connected. Revenue and quota progress are on the Overview tab." />}
      {activeTab === "calls" && <WaitingPanel title="Calls" message="Call history, recordings and outcomes appear once a phone-call provider is connected (client decision)." />}
      {activeTab === "reports" && <WaitingPanel title="Call reports" message="AI call reports appear once calling and the AI provider are connected (client decision)." />}
      {activeTab === "coaching-notes" && <CoachingNotesTab rep={rep} canManage={canManage} />}
      {activeTab === "calibration" && <CalibrationSessions calibration={detail.calibration} />}
      {activeTab === "account-settings" && (
        <AccountSettingsTab key={JSON.stringify(detail.settings) + rep.name} rep={rep} settings={detail.settings} managers={managers} canManage={canManage} onSaved={reload} onDeactivate={() => setDialog("deactivate")} />
      )}
      {activeTab === "activity-log" && <ActivityLogTab rep={rep} />}

      {dialog === "edit" && (
        <EditRepModal
          isOpen
          rep={rep}
          managers={managers}
          onClose={() => setDialog(null)}
          onSave={async (changes) => {
            await updateRep(rep.id, changes);
            reload();
          }}
        />
      )}
      {dialog === "note" && (
        <AddManagerNoteModal
          isOpen
          repName={rep.name}
          onClose={() => setDialog(null)}
          onAdd={async (body) => {
            await addRepNote(rep.id, { kind: "manager", body });
            reload();
          }}
        />
      )}
      <DeactivateRepModal rep={dialog === "deactivate" ? rep : null} onClose={() => setDialog(null)} onConfirm={deactivate} />
    </div>
  );
}

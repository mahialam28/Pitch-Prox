"use client";

import React, { useCallback, useEffect, useState } from "react";

import SalesRepsHeader from "./components/sales-reps-header";
import SalesRepsStats from "./components/sales-reps-stats";
import SalesRepsTable from "./components/sales-reps-table";
import TeamPerformance from "./components/team-performance";
import TopPerformers from "./components/top-performers";
import QuickActions from "./components/quick-actions";
import RecentAlerts from "./components/recent-alerts";
import AdjustQuotaModal from "./components/adjust-quota-modal";
import LeaderboardModal from "./components/leaderboard-modal";
import { ExportTeamReportModal } from "./components/sales-rep-modals";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { loadTeam } from "./team-api";

// Live Sales Reps page (lib/sales-team). Super Admin and Admin Manager manage; Support views.
export default function SalesRepsPage() {
  const [team, setTeam] = useState(null);
  const [me, setMe] = useState(null);
  const [managers, setManagers] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [quotaRep, setQuotaRep] = useState(null);

  const reload = useCallback(() => loadTeam().then(setTeam).catch((error) => showError("Couldn't load the sales team", error.message)), []);
  useEffect(() => {
    reload();
    apiRequest("/api/v1/me").then((data) => setMe(data.user)).catch(() => {});
    apiRequest("/api/v1/admin/managers").then((data) => setManagers(data.results)).catch(() => {});
  }, [reload]);

  const canManage = ["super_admin", "admin_manager"].includes(me?.role);
  const openQuota = (rep = null) => {
    setQuotaRep(rep);
    setDialog("quota");
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Section 1: Page Header ── */}
      <SalesRepsHeader />

      {/* ── Section 2: 6 Top Stats Metrics ── */}
      <SalesRepsStats stats={team?.stats} />

      {/* ── Section 3: Main Content Area (Table + Sidebar Widgets) ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="w-full min-w-0 lg:col-span-8 xl:col-span-8 2xl:col-span-9">
          <SalesRepsTable reps={team?.reps} managers={managers} canManage={canManage} onChanged={reload} onAdjustQuota={openQuota} />
        </div>

        <div className="w-full min-w-0 lg:col-span-4 xl:col-span-4 2xl:col-span-3 flex flex-col gap-6">
          <TeamPerformance distribution={team?.distribution} tracked={team?.tracked} />
          <TopPerformers reps={team?.topPerformers} />
          <QuickActions
            onAdjustQuotas={canManage && team ? () => openQuota() : undefined}
            onViewLeaderboard={() => setDialog("leaderboard")}
            onExportReport={() => team && setDialog("export")}
          />
          <RecentAlerts alerts={team?.alerts} />
        </div>
      </div>

      {/* ── Dialogs (mounted only while open) ── */}
      {dialog === "quota" && (
        <AdjustQuotaModal isOpen reps={team.reps} month={team.month} focusRep={quotaRep} onClose={() => setDialog(null)} onSaved={reload} />
      )}
      {dialog === "leaderboard" && <LeaderboardModal isOpen onClose={() => setDialog(null)} />}
      {dialog === "export" && <ExportTeamReportModal isOpen reps={team.reps} monthLabel={team.monthLabel} onClose={() => setDialog(null)} />}
    </div>
  );
}

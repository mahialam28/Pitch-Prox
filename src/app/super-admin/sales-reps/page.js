"use client";

import React, { useState } from "react";

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

export default function SalesRepsPage() {
  const [adjustQuotaOpen, setAdjustQuotaOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Section 1: Page Header ── */}
      <SalesRepsHeader />

      {/* ── Section 2: 6 Top Stats Metrics ── */}
      <SalesRepsStats />

      {/* ── Section 3: Main Content Area (Table + Sidebar Widgets) ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Sales Reps Roster Table */}
        <div className="w-full min-w-0 lg:col-span-8 xl:col-span-8 2xl:col-span-9">
          <SalesRepsTable />
        </div>

        {/* Right Sidebar Column: Performance Donut, Top Performers, Quick Actions, Recent Alerts */}
        <div className="w-full min-w-0 lg:col-span-4 xl:col-span-4 2xl:col-span-3 flex flex-col gap-6">
          {/* Widget 1: Team Performance Donut */}
          <TeamPerformance />

          {/* Widget 2: Top Performers Ranked List */}
          <TopPerformers />

          {/* Widget 3: Quick Actions (3 items) */}
          <QuickActions
            onAdjustQuotas={() => setAdjustQuotaOpen(true)}
            onViewLeaderboard={() => setLeaderboardOpen(true)}
            onExportReport={() => setExportOpen(true)}
          />

          {/* Widget 4: Recent Alerts */}
          <RecentAlerts />
        </div>
      </div>

      {/* ── Interactive Modals ── */}
      <AdjustQuotaModal
        isOpen={adjustQuotaOpen}
        onClose={() => setAdjustQuotaOpen(false)}
      />

      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />

      <ExportTeamReportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}

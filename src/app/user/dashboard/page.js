"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import PerformanceHeader from "./components/performance-header";
import PerformanceStatsGrid from "./components/performance-stats";
import PerformanceTrend from "./components/performance-trend";
import LeadPipeline from "./components/lead-pipeline";
import RecentCalls from "./components/recent-calls";
import DashboardLoading from "./loading";
import CalibrationReminder from "../calibration/components/calibration";
import { useCalibrationStatus } from "../calibration/use-calibration-status";

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  // Reminder until the user has calibrated (calling stays locked until then)
  const { locked: calibrationPending } = useCalibrationStatus();

  useEffect(() => {
    let active = true;
    apiRequest("/api/v1/dashboard")
      .then((data) => active && setDashboard(data))
      .catch((err) => active && setError(err.message));
    return () => { active = false; };
  }, [attempt]);

  const retry = () => { setError(""); setDashboard(null); setAttempt((n) => n + 1); };

  if (error) {
    return (
      <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm p-8 flex flex-col items-center text-center gap-3">
        <AlertCircle className="h-8 w-8 text-red" />
        <p className="text-sm font-semibold text-dark-black/80">We couldn&apos;t load your dashboard.</p>
        <p className="text-xs text-light-black">{error}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-2 px-4 py-2 text-xs font-semibold text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!dashboard) return <DashboardLoading />;

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {calibrationPending && <CalibrationReminder />}

      {/* Top Welcome Title Overview Block */}
      <PerformanceHeader userName={dashboard.user?.name} />

      {/* Three Column Analytics Grid Blocks */}
      <PerformanceStatsGrid metrics={dashboard.metrics} />

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <div className="lg:col-span-2 flex w-full">
          <PerformanceTrend />
        </div>

        <div className="lg:col-span-1 flex w-full">
          <LeadPipeline pipeline={dashboard.pipeline} />
        </div>
      </div>

      {/* Recent Calls Table */}
      <RecentCalls />
    </div>
  );
};

export default DashboardPage;

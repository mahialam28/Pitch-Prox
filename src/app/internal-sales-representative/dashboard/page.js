"use client";

import React, { useEffect, useState } from "react";
import DashboardHeader from "./components/dashboard-header";
import OverviewStats from "./components/overview-stats";
import PerformanceTrend from "./components/performance-trend";
import TopSales from "./components/top-sales";
import BusinessInsights from "./components/business-insights";
import SearchUser from "./components/search-user";
import EmployeeRoster from "./components/employee-roster";
import OperationalAlerts from "./components/operational-alerts";
import RecentActivity from "./components/recent-activity";
import MyCoachingNotes from "./components/my-coaching-notes";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Sales overview (live): the rep's own pipeline and accounts, or company-wide for admins.
export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/sales/dashboard")
      .then((result) => !cancelled && setData(result))
      .catch((error) => showError("Dashboard not loaded", error.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return <div className="w-full bg-white rounded-2xl border border-light-gray p-10 text-center text-sm text-medium-black">Loading dashboard…</div>;

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <DashboardHeader />
      <OverviewStats overview={data.overview} />
      {/* Reps receive their managers' coaching notes here */}
      {data.scope === "rep" && <MyCoachingNotes />}
      <div className="w-full grid grid-cols-1 2xl:grid-cols-2 gap-6 items-stretch">
        <div className="flex w-full min-w-0">
          <PerformanceTrend trend={data.trend} />
        </div>
        <div className="flex w-full min-w-0">
          <TopSales reps={data.topSales} />
        </div>
      </div>
      <div className="w-full grid grid-cols-1 2xl:grid-cols-2 gap-6 items-stretch">
        <div className="flex w-full min-w-0">
          <BusinessInsights insights={data.insights} />
        </div>
        <div className="flex w-full min-w-0">
          <SearchUser accounts={data.recentAccounts} />
        </div>
      </div>
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="flex w-full min-w-0">
          <EmployeeRoster roster={data.roster} />
        </div>
        <div className="flex w-full min-w-0">
          <OperationalAlerts alerts={data.alerts} />
        </div>
        <div className="flex w-full min-w-0">
          <RecentActivity activity={data.activity} />
        </div>
      </div>
    </div>
  );
}

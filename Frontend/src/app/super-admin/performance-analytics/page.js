"use client";

import React from "react";
import AnalyticsHeader from "./components/analytics-header";
import RevenueBreakdown from "./components/revenue-breakdown";
import UpgradeIntelligence from "./components/upgrade-intelligence";
import UnitEconomics from "./components/unit-economics";
import InfrastructureAndHealth from "./components/infrastructure-and-health";
import BonusPerformance from "./components/bonus-performance";
import SalesInsights from "./components/sales-insights";
import TopCancellations from "./components/top-cancellations";
import RiskAccounts from "./components/risk-accounts";
import Alerts from "./components/alerts";

export default function SuperAdminPerformanceAnalyticsPage() {
  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 max-w-full overflow-hidden">
      {/* 1. Header with Title, Subtitle, and 5 KPI Cards */}
      <AnalyticsHeader />

      {/* 2. Content Grid: Revenue Breakdown (Left) & Upgrade Intelligence (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* Left Side: Revenue Breakdown */}
        <div className="xl:col-span-4 w-full">
          <RevenueBreakdown />
        </div>

        {/* Right Side: Upgrade Intelligence */}
        <div className="xl:col-span-8 w-full">
          <UpgradeIntelligence />
        </div>
      </div>

      {/* 3. Unit Economics Section */}
      <UnitEconomics />

      {/* 4. AI Infrastructure & Health Section */}
      <InfrastructureAndHealth />

      {/* 5. Rep Bonus Performance (Left) & Sales Rep Efficiency Insights (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <BonusPerformance />
        <SalesInsights />
      </div>

      {/* 6. Top Cancellation Reasons (Left) & At-Risk Accounts (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <TopCancellations />
        <RiskAccounts />
      </div>

      {/* 7. Alerts & Operational Monitoring Section */}
      <Alerts />
    </div>
  );
}

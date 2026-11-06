"use client";

import React, { useEffect, useState } from "react";
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
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Live Performance Analytics (lib/business-analytics). Costs, AI and telephony numbers wait
// for their providers; revenue is subscription value until Stripe is connected.
export default function SuperAdminPerformanceAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/admin/analytics")
      .then((result) => !cancelled && setData(result))
      .catch((error) => showError("Analytics not loaded", error.message));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 max-w-full overflow-hidden">
      <AnalyticsHeader data={data} />

      {!data ? (
        <div className="bg-white rounded-2xl border border-light-gray p-10 text-center text-sm text-medium-black">Loading analytics…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            <div className="xl:col-span-4 w-full">
              <RevenueBreakdown revenue={data.revenue} />
            </div>
            <div className="xl:col-span-8 w-full">
              <UpgradeIntelligence upgrades={data.upgrades} />
            </div>
          </div>

          <UnitEconomics unitEconomics={data.unitEconomics} />
          <InfrastructureAndHealth />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            <BonusPerformance bonus={data.bonus} />
            <SalesInsights insights={data.insights} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            <TopCancellations cancellations={data.cancellations} churnRate={data.kpis.churnRate} />
            <RiskAccounts accounts={data.riskAccounts} />
          </div>

          <Alerts alerts={data.alerts} generatedAt={data.generatedAt} />
        </>
      )}
    </div>
  );
}

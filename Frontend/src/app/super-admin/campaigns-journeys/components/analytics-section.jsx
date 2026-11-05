"use client";

import React from "react";
import CampaignMetrics from "./campaign-metrics";
import EmailEngagementChart from "./email-engagement-chart";
import AnalyticsJourneysTable from "./analytics-journeys-table";
import ConversionFunnelCard from "./conversion-funnel-card";
import DeliveryInsightsCard from "./delivery-insights-card";
import TopPerformingContent from "./top-performing-content";

export default function AnalyticsSection() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Top 5 Metric KPI Cards */}
      <CampaignMetrics />

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Email Engagement Chart & Active Journeys Table (7 cols) */}
        <div className="xl:col-span-7 2xl:col-span-7 flex flex-col gap-6 w-full">
          <EmailEngagementChart />
          <AnalyticsJourneysTable />
        </div>

        {/* Right Column: Conversion Funnel, Segment Delivery Insights & Top Performing Content (5 cols) */}
        <div className="xl:col-span-5 2xl:col-span-5 flex flex-col gap-6 w-full">
          <ConversionFunnelCard />
          <DeliveryInsightsCard />
          <TopPerformingContent />
        </div>
      </div>
    </div>
  );
}

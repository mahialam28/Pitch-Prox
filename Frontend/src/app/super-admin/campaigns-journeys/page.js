"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CampaignsHeader from "./components/campaigns-header";
import CampaignMetrics from "./components/campaign-metrics";
import ActiveJourneysSection from "./components/active-journeys-section";
import RecentActivitySection, {
  OVERVIEW_ACTIVITIES,
  LIFECYCLE_ACTIVITIES,
} from "./components/recent-activity-section";
import FailedDeliveriesSection from "./components/failed-deliveries-section";
import QuickActionsSection from "./components/quick-actions-section";
import JourneyHealthSection from "./components/journey-health-section";
import CampaignHistorySection from "./components/campaign-history-section";
import CreateCampaignSection from "./components/create-campaign-section";
import TemplatesStats from "./components/templates-stats";
import TemplatesSection from "./components/templates-section";
import SegmentsSection from "./components/segments-section";
import AnalyticsSection from "./components/analytics-section";
import BroadcastCampaignsSection from "./components/broadcast-campaigns-section";

function CampaignsJourneysContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* 1. Navigation Header */}
      <CampaignsHeader
        // "create-campaign" is a sub-view of Broadcast Campaigns
        activeTab={activeTab === "create-campaign" ? "broadcast-campaigns" : activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
        }}
        onCreateJourney={() => router.push("/super-admin/campaigns-journeys/journeys/create")}
        onCreateCampaign={() => setActiveTab("create-campaign")}
        onNewTemplate={() =>
          router.push("/super-admin/campaigns-journeys/templates/new-template")
        }
      />

      {/* 2. Content Area */}
      <AnimatePresence mode="wait">
        {/* ── TAB 1: Overview ── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6 w-full"
          >
            {/* Top 5 Metric KPI Cards */}
            <CampaignMetrics />

            {/* Main Grid: Left (Active Journeys Table) & Right (Recent Activity + Failed Deliveries + Quick Actions) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
              {/* Left Column: Active Journeys Table */}
              <div className="xl:col-span-7 2xl:col-span-7 w-full">
                <ActiveJourneysSection />
              </div>

              {/* Right Column: Recent Activity + Failed Deliveries + Quick Actions */}
              <div className="xl:col-span-5 2xl:col-span-5 w-full flex flex-col gap-6">
                <RecentActivitySection
                  showIcons={true}
                  activities={OVERVIEW_ACTIVITIES}
                />
                <FailedDeliveriesSection />
                <QuickActionsSection />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 2: Lifecycle Journeys ── */}
        {activeTab === "lifecycle-journeys" && (
          <motion.div
            key="lifecycle-journeys"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6 w-full"
          >
            {/* Top 5 Metric KPI Cards */}
            <CampaignMetrics />

            {/* Main Grid: Left (Active Journeys Table) & Right (Journey Health + Recent Activity) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
              {/* Left Column: Active Journeys Table */}
              <div className="xl:col-span-7 2xl:col-span-7 w-full">
                <ActiveJourneysSection />
              </div>

              {/* Right Column: Journey Health + Recent Activity */}
              <div className="xl:col-span-5 2xl:col-span-5 w-full flex flex-col gap-6">
                <JourneyHealthSection />
                <RecentActivitySection
                  showIcons={false}
                  activities={LIFECYCLE_ACTIVITIES}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: Broadcast Campaigns ── */}
        {activeTab === "broadcast-campaigns" && (
          <motion.div
            key="broadcast-overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <BroadcastCampaignsSection
              onCreateCampaign={() => setActiveTab("create-campaign")}
              onCreateSegment={() => setActiveTab("segments")}
              onViewAnalytics={() => setActiveTab("analytics")}
              onViewIssues={() => setActiveTab("overview")}
            />
          </motion.div>
        )}

        {activeTab === "create-campaign" && (
          <motion.div
            key="create-campaign"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
              {/* Left Column: Campaign History Table */}
              <div className="xl:col-span-7 2xl:col-span-7 w-full">
                <CampaignHistorySection />
              </div>

              {/* Right Column: Create Campaign Form Card */}
              <div className="xl:col-span-5 2xl:col-span-5 w-full">
                <CreateCampaignSection />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: Templates ── */}
        {activeTab === "templates" && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6 w-full"
          >
            {/* Top 4 KPI Metric Cards */}
            <TemplatesStats />

            {/* Email Templates Section (Search, Filters, 3-Col Cards Grid, Pagination) */}
            <TemplatesSection />
          </motion.div>
        )}

        {/* ── TAB 5: Segments ── */}
        {activeTab === "segments" && (
          <motion.div
            key="segments"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <SegmentsSection />
          </motion.div>
        )}

        {/* ── TAB 6: Analytics ── */}
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <AnalyticsSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CampaignsJourneysPage() {
  return (
    <Suspense fallback={<div className="w-full py-12 text-center text-sm text-light-black">Loading...</div>}>
      <CampaignsJourneysContent />
    </Suspense>
  );
}

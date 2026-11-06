"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CampaignsHeader from "./components/campaigns-header";
import CampaignMetrics from "./components/campaign-metrics";
import ActiveJourneysSection from "./components/active-journeys-section";
import RecentActivitySection, { toActivities } from "./components/recent-activity-section";
import FailedDeliveriesSection from "./components/failed-deliveries-section";
import QuickActionsSection from "./components/quick-actions-section";
import JourneyHealthSection from "./components/journey-health-section";
import CampaignHistorySection from "./components/campaign-history-section";
import CreateCampaignSection from "./components/create-campaign-section";
import TemplatesTab from "./components/templates-tab";
import SegmentsSection from "./components/segments-section";
import AnalyticsSection from "./components/analytics-section";
import BroadcastCampaignsSection from "./components/broadcast-campaigns-section";
import { useApi } from "./campaign-api";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } };

// Campaigns & Journeys (live): broadcasts, lifecycle journeys, templates and segments
// for PitchProX customers (lib/campaigns). Emails wait in the outbox until an email service is connected.
function CampaignsJourneysContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");

  // Follow ?tab= when it changes (adjusted during render, not in an effect)
  const tabParam = searchParams.get("tab");
  const [shownTabParam, setShownTabParam] = useState(tabParam);
  if (shownTabParam !== tabParam) {
    setShownTabParam(tabParam);
    if (tabParam) setActiveTab(tabParam);
  }

  const me = useApi("/api/v1/me");
  const role = me.data?.user?.role;
  const canManage = ["super_admin", "admin_manager"].includes(role);
  const usesData = ["overview", "lifecycle-journeys", "analytics", "create-campaign"].includes(activeTab);
  const overview = useApi(usesData ? "/api/v1/campaigns/overview" : null);
  const journeys = useApi(["overview", "lifecycle-journeys", "analytics"].includes(activeTab) ? "/api/v1/campaigns/journeys" : null);
  const segments = useApi(["overview", "lifecycle-journeys", "analytics"].includes(activeTab) ? "/api/v1/campaigns/segments" : null);
  const templates = useApi(activeTab === "lifecycle-journeys" ? "/api/v1/campaigns/templates" : null);
  const campaigns = useApi(activeTab === "create-campaign" ? "/api/v1/campaigns/broadcasts" : null);
  const refresh = () => {
    overview.reload();
    journeys.reload();
    campaigns.reload();
  };

  const journeyList = journeys.data?.results ?? [];
  const segmentList = segments.data?.segments ?? [];

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <CampaignsHeader
        activeTab={activeTab === "create-campaign" ? "broadcast-campaigns" : activeTab}
        onTabChange={setActiveTab}
        onCreateJourney={() => router.push("/super-admin/campaigns-journeys/journeys/create")}
        onCreateCampaign={() => setActiveTab("create-campaign")}
        onNewTemplate={() => router.push("/super-admin/campaigns-journeys/templates/new-template")}
      />

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" {...fade} className="flex flex-col gap-6 w-full">
            <CampaignMetrics overview={overview.data} />
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
              <div className="xl:col-span-7 w-full">
                <ActiveJourneysSection title="Journeys" journeys={journeyList} segments={segmentList} loading={!journeys.data} canManage={canManage} onChanged={refresh} />
              </div>
              <div className="xl:col-span-5 w-full flex flex-col gap-6">
                <RecentActivitySection showIcons activities={toActivities(overview.data?.activity)} />
                <FailedDeliveriesSection overview={overview.data} canRun={role === "super_admin"} onRan={refresh} />
                <QuickActionsSection />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "lifecycle-journeys" && (
          <motion.div key="lifecycle-journeys" {...fade} className="flex flex-col gap-6 w-full">
            <CampaignMetrics overview={overview.data} />
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
              <div className="xl:col-span-7 w-full">
                <ActiveJourneysSection title="Lifecycle Journeys" journeys={journeyList} segments={segmentList} loading={!journeys.data} canManage={canManage} onChanged={refresh} />
              </div>
              <div className="xl:col-span-5 w-full flex flex-col gap-6">
                <JourneyHealthSection journeys={journeyList} templates={templates.data?.results ?? []} />
                <RecentActivitySection showIcons={false} activities={toActivities((overview.data?.activity ?? []).filter((entry) => /journey/i.test(entry.summary)))} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "broadcast-campaigns" && (
          <motion.div key="broadcast-overview" {...fade} className="w-full">
            <BroadcastCampaignsSection
              onCreateCampaign={() => setActiveTab("create-campaign")}
              onCreateSegment={() => setActiveTab("segments")}
              onViewAnalytics={() => setActiveTab("analytics")}
              onViewIssues={() => setActiveTab("overview")}
            />
          </motion.div>
        )}

        {activeTab === "create-campaign" && (
          <motion.div key="create-campaign" {...fade} className="w-full">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
              <div className="xl:col-span-7 w-full">
                <CampaignHistorySection campaigns={campaigns.data?.results ?? []} loading={!campaigns.data} canManage={canManage} onChanged={refresh} />
              </div>
              <div className="xl:col-span-5 w-full">
                <CreateCampaignSection canManage={canManage} onCreated={refresh} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "templates" && (
          <motion.div key="templates" {...fade} className="flex flex-col gap-6 w-full">
            <TemplatesTab />
          </motion.div>
        )}

        {activeTab === "segments" && (
          <motion.div key="segments" {...fade} className="w-full">
            <SegmentsSection />
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div key="analytics" {...fade} className="w-full">
            <AnalyticsSection overview={overview.data} journeys={journeyList} segments={segmentList} />
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

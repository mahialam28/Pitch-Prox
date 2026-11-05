"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { SAVED_SEGMENTS } from "../../segments-data";
import CampaignsHeader from "../../components/campaigns-header";
import SegmentHeaderCard from "./components/segment-header-card";
import SegmentKpiCards from "./components/segment-kpi-cards";
import CampaignUsageTable from "./components/campaign-usage-table";
import SegmentInsightsCard from "./components/segment-insights-card";
import SegmentLeadsTable from "./components/segment-leads-table";
import EditSegmentModal from "../../components/edit-segment-modal";
import AddToExistingModal from "../../components/add-to-existing-modal";

export default function SegmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const initialSegment =
    SAVED_SEGMENTS.find((s) => String(s.id) === String(id)) || SAVED_SEGMENTS[0];

  const [segment, setSegment] = useState(initialSegment);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addLeadsModalOpen, setAddLeadsModalOpen] = useState(false);

  const handleDuplicate = () => {
    toast.success(`Segment "${segment.name}" duplicated!`);
  };

  const handleExport = () => {
    toast.success(`Exporting leads for "${segment.name}" (CSV)...`);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 min-w-0">
      {/* ── 0. Main Campaigns Navigation Header & Tabs Bar ── */}
      <CampaignsHeader
        activeTab="segments"
        onTabChange={(tabId) => {
          router.push(`/super-admin/campaigns-journeys?tab=${tabId}`);
        }}
        onCreateJourney={() => router.push("/super-admin/campaigns-journeys/journeys/create")}
        onCreateCampaign={() =>
          router.push("/super-admin/campaigns-journeys?tab=create-campaign")
        }
        onNewTemplate={() =>
          router.push("/super-admin/campaigns-journeys/templates/new-template")
        }
      />

      {/* ── 1. Top Back Navigation Link ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/super-admin/campaigns-journeys?tab=segments"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Segments</span>
        </Link>
      </div>

      {/* ── 2. Segment Header Banner ── */}
      <SegmentHeaderCard
        segment={segment}
        onDuplicate={handleDuplicate}
        onExport={handleExport}
        onEdit={() => setEditModalOpen(true)}
      />

      {/* ── 3. Top 4 Metric KPI Cards ── */}
      <SegmentKpiCards kpis={segment.kpis} />

      {/* ── 4. Middle Two-Column Grid: Campaign Usage & Segment Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full min-w-0">
        {/* Left Column: Campaign Usage Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col w-full">
          <CampaignUsageTable campaigns={segment.campaigns} />
        </div>

        {/* Right Column: Segment Insights Gauge Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col w-full">
          <SegmentInsightsCard insights={segment.insights} />
        </div>
      </div>

      {/* ── 5. Bottom Section: Leads in this Segment ── */}
      <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs">
        <SegmentLeadsTable
          segmentName={segment.name}
          totalLeadsCount={segment.leadsCount}
          onAddLeadsClick={() => setAddLeadsModalOpen(true)}
        />
      </div>

      {/* ── 6. Modals ── */}
      <EditSegmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        segment={segment}
        onUpdateSuccess={(updated) => {
          setSegment(updated);
        }}
      />

      <AddToExistingModal
        isOpen={addLeadsModalOpen}
        onClose={() => setAddLeadsModalOpen(false)}
        selectedLeads={[]}
      />
    </div>
  );
}

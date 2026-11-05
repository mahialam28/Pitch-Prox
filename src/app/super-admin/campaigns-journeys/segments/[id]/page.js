"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { SAVED_SEGMENTS, describeRule, findSegment, membersOf } from "../../user-segments";
import CampaignsHeader from "../../components/campaigns-header";
import SegmentHeaderCard from "./components/segment-header-card";
import SegmentKpiCards from "./components/segment-kpi-cards";
import CampaignUsageTable from "./components/campaign-usage-table";
import UsersTable from "../../components/users-table";
import EditSegmentModal from "../../components/edit-segment-modal";

// One segment: who is in it right now, its rules, and where it is used
export default function SegmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [segment, setSegment] = useState(() => findSegment(id) ?? SAVED_SEGMENTS[0]);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const members = membersOf(segment);
  const paid = members.filter((member) => member.subscriptionStatus === "Active" && member.plan !== "Free Trial").length;
  const kpis = {
    users: String(members.length),
    usersNote: segment.type === "Static" ? "Fixed list" : "Updates automatically",
    paid: String(paid),
    paidNote: members.length ? `${Math.round((paid / members.length) * 100)}% of this segment` : "",
    trial: String(members.filter((member) => member.trialStatus === "Active Trial").length),
    usage: members.length ? `${Math.round(members.reduce((sum, member) => sum + member.callUsagePct, 0) / members.length)}%` : "0%",
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 min-w-0">
      <CampaignsHeader
        activeTab="segments"
        onTabChange={(tabId) => router.push(`/super-admin/campaigns-journeys?tab=${tabId}`)}
        onCreateJourney={() => router.push("/super-admin/campaigns-journeys/journeys/create")}
        onCreateCampaign={() => router.push("/super-admin/campaigns-journeys?tab=create-campaign")}
        onNewTemplate={() => router.push("/super-admin/campaigns-journeys/templates/new-template")}
      />

      <div className="flex items-center justify-between">
        <Link href="/super-admin/campaigns-journeys?tab=segments" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-medium-teal transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Segments</span>
        </Link>
      </div>

      <SegmentHeaderCard
        segment={{ ...segment, usersCount: members.length }}
        onDuplicate={() => toast.success(`Segment "${segment.name}" duplicated!`)}
        onExport={() => toast.success(`Exporting users in "${segment.name}" (CSV)...`)}
        onEdit={() => setEditModalOpen(true)}
      />

      <SegmentKpiCards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full min-w-0">
        <div className="lg:col-span-7 flex flex-col w-full">
          <CampaignUsageTable campaigns={segment.campaigns ?? []} />
        </div>
        <div className="lg:col-span-5 flex flex-col w-full">
          <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs h-full flex flex-col gap-3">
            <h3 className="text-base font-bold text-dark-black/85 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {segment.type === "Static" ? "Static list" : "Entry Rules"}
            </h3>
            {segment.type === "Static" ? (
              <p className="text-xs text-medium-black">This segment contains the {members.length} users an admin added. It does not change automatically.</p>
            ) : (
              <>
                <p className="text-xs text-medium-black">
                  Users who match <span className="font-semibold">{segment.rules?.match === "any" ? "ANY" : "ALL"}</span> of these conditions are in this segment. Membership updates automatically.
                </p>
                <ul className="space-y-2">
                  {(segment.rules?.conditions ?? []).map((condition, index) => (
                    <li key={index} className="px-3 py-2 rounded-xl bg-light-gray/50 text-xs font-medium text-dark-black/80">{describeRule(condition)}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      <UsersTable users={members} title="Users in this Segment" subtitle={`${members.length} ${members.length === 1 ? "user" : "users"}`} />

      <EditSegmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        segment={segment}
        onUpdateSuccess={(updated) => {
          setSegment(updated);
          toast.success("Segment saved.");
        }}
      />
    </div>
  );
}

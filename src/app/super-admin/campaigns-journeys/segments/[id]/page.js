"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Zap } from "lucide-react";
import { describeRule, formatDay, segmentUpdatedLabel } from "../../user-segments";
import CampaignsHeader from "../../components/campaigns-header";
import SegmentHeaderCard from "./components/segment-header-card";
import SegmentKpiCards from "./components/segment-kpi-cards";
import CampaignUsageTable from "./components/campaign-usage-table";
import UsersTable from "../../components/users-table";
import SegmentFormModal from "../../components/segment-form-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";
import { campaignApi, useApi, useCanManage } from "../../campaign-api";

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
function downloadMembers(segment, members) {
  const header = ["Name", "Email", "Company", "Plan", "Subscription Status", "Trial Status", "Call Usage %", "Calibration Status", "Payment Status", "Last Login", "Signup Date"];
  const rows = members.map((member) => [member.name, member.email, member.company, member.plan, member.subscriptionStatus, member.trialStatus, member.callUsagePct, member.calibrationStatus, member.paymentStatus, member.lastLogin ?? "", member.signupDate]);
  const url = URL.createObjectURL(new Blob([[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${segment.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-users.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// One segment (live): who is in it now, its rules, and the campaigns / journeys using it
export default function SegmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { data, error, reload } = useApi(id ? `/api/v1/campaigns/segments/${id}` : null);
  const canManage = useCanManage();
  const [dialog, setDialog] = useState(null); // "edit" | "delete"

  if (!data) return <div className="w-full py-20 text-center text-sm text-light-black">{error ?? "Loading segment…"}</div>;

  const { segment, members, users } = data;
  const paid = members.filter((member) => member.subscriptionStatus === "Active" && member.trialStatus !== "Active Trial").length;
  const kpis = {
    users: String(members.length),
    usersNote: segment.type === "Static" ? "Fixed list" : "Updates automatically",
    paid: String(paid),
    paidNote: members.length ? `${Math.round((paid / members.length) * 100)}% of this segment` : "",
    trial: String(members.filter((member) => member.trialStatus === "Active Trial").length),
    usage: members.length ? `${Math.round(members.reduce((sum, member) => sum + member.callUsagePct, 0) / members.length)}%` : "0%",
  };
  const usage = [
    ...segment.campaigns.map((item) => ({ id: item.id, name: `${item.name} (broadcast)`, status: item.status.toUpperCase(), sent: String(item.recipients ?? 0), openRate: "—", conversion: "—", iconType: "navigation" })),
    ...segment.journeys.map((item) => ({ id: item.id, name: `${item.name} (journey)`, status: item.status === "active" ? "ACTIVE" : item.status.toUpperCase(), sent: "—", openRate: "—", conversion: "—", iconType: "tag" })),
  ];

  const duplicate = async () => {
    try {
      const body = { name: `${segment.name} (copy)`.slice(0, 120), description: segment.description ?? "", type: segment.type, ...(segment.type === "Dynamic" ? { rules: segment.rules } : { userIds: segment.userIds }) };
      const result = await campaignApi.createSegment(body);
      showSavedToast("Segment duplicated", `"${result.segment.name}" was created.`);
      router.push(`/super-admin/campaigns-journeys/segments/${result.segment.id}`);
    } catch (failure) {
      showError("Segment not duplicated", failure.message);
    }
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
        {canManage && !segment.system && (
          <button type="button" onClick={() => setDialog("delete")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" /> Delete segment
          </button>
        )}
      </div>

      <SegmentHeaderCard
        segment={{ ...segment, usersCount: members.length, iconType: segment.type === "Static" ? "user" : "alert", createdAt: formatDay(String(segment.createdAt).slice(0, 10)), updatedAt: segmentUpdatedLabel(segment), creator: segment.creator ?? "—" }}
        onDuplicate={canManage ? duplicate : undefined}
        onExport={() => downloadMembers(segment, members)}
        onEdit={canManage ? () => setDialog("edit") : undefined}
      />

      <SegmentKpiCards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full min-w-0">
        <div className="lg:col-span-7 flex flex-col w-full">
          <CampaignUsageTable campaigns={usage} />
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

      <UsersTable users={members} segments={[segment]} title="Users in this Segment" subtitle={`${members.length} ${members.length === 1 ? "user" : "users"}`} />

      {dialog === "edit" && (
        <SegmentFormModal
          isOpen
          users={users}
          onClose={() => setDialog(null)}
          segment={segment}
          onSave={() => {
            showSavedToast("Segment saved", segment.type === "Dynamic" ? "Membership was updated from the new rules." : "The user list was updated.");
            reload();
          }}
        />
      )}
      <ConfirmDialog
        isOpen={dialog === "delete"}
        onClose={() => setDialog(null)}
        title="Delete this segment?"
        icon={Trash2}
        iconTone="danger"
        message={`"${segment.name}" will be removed. Sent campaigns keep their history.`}
        confirmLabel="Delete Segment"
        onConfirm={async () => {
          try {
            await campaignApi.deleteSegment(segment.id);
            showSavedToast("Segment deleted", segment.name);
            router.push("/super-admin/campaigns-journeys?tab=segments");
          } catch (failure) {
            showError("Segment not deleted", failure.message);
          }
        }}
      />
    </div>
  );
}

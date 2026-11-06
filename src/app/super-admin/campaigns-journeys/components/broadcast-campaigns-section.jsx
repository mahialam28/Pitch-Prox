"use client";

import React from "react";
import { Badge, Card, CardLink, DashboardGrid, DataTable, KpiRow, StackedList } from "@/components/shared/dashboard-ui";
import { formatWhen, percent, useApi } from "../campaign-api";

// Broadcast Campaigns overview (live). Opens and clicks appear once an email service reports them.
const STATUS_TONE = { scheduled: "blue", sent: "green", sending: "blue", canceled: "gray", failed: "red" };
const outlineButton = "w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 cursor-pointer";

export default function BroadcastCampaignsSection({ onCreateCampaign, onCreateSegment, onViewAnalytics, onViewIssues }) {
  const campaigns = useApi("/api/v1/campaigns/broadcasts");
  const overview = useApi("/api/v1/campaigns/overview");
  const rows = campaigns.data?.results ?? [];
  const totals = rows.reduce((sum, row) => ({ total: sum.total + row.stats.total, sent: sum.sent + row.stats.sent, queued: sum.queued + row.stats.queued, opened: sum.opened + row.stats.opened, clicked: sum.clicked + row.stats.clicked, skipped: sum.skipped + row.stats.skipped }), { total: 0, sent: 0, queued: 0, opened: 0, clicked: 0, skipped: 0 });
  const kpis = [
    { label: "Campaigns Sent (30 days)", value: String(overview.data?.campaigns.sent30 ?? "—"), note: `${overview.data?.campaigns.scheduled ?? 0} scheduled` },
    { label: "Emails Delivered", value: String(totals.sent), note: totals.queued ? `${totals.queued} waiting for an email service` : "All handed over", good: !totals.queued },
    { label: "Avg. Open Rate", value: percent(totals.opened, totals.sent), note: totals.sent ? "Of delivered emails" : "Needs delivered emails" },
    { label: "Avg. Click Rate", value: percent(totals.clicked, totals.sent), note: totals.sent ? "Of delivered emails" : "Needs delivered emails" },
    { label: "Unsubscribed", value: String(overview.data?.suppressed ?? 0), note: `${totals.skipped} emails skipped` },
  ];
  const issues = (overview.data?.issues ?? []).slice(0, 4).map((issue) => ({ title: issue.subject, subtitle: `${issue.email} · ${issue.reason ?? issue.status}`, badge: { tone: issue.status === "failed" ? "red" : "amber", label: issue.status } }));

  return (
    <div className="flex flex-col gap-5 font-secondary">
      <KpiRow kpis={kpis} />
      <DashboardGrid
        main={
          <>
            <Card title="Broadcast Campaigns" action={<CardLink onClick={onCreateCampaign}>Create campaign</CardLink>}>
              {!rows.length ? (
                <p className="text-sm text-light-black py-6 text-center">{campaigns.data ? "No campaigns yet." : "Loading…"}</p>
              ) : (
                <DataTable
                  rowKey={(row) => row.id}
                  rows={rows.slice(0, 10)}
                  columns={[
                    {
                      key: "name",
                      label: "Campaign",
                      render: (row) => (
                        <span>
                          <span className="block font-medium text-dark-black">{row.name}</span>
                          <span className="block text-[11px] text-light-black">{row.templateName ?? "—"} · {row.emailType ?? ""}</span>
                        </span>
                      ),
                    },
                    { key: "segmentName", label: "Audience", render: (row) => `${row.segmentName ?? "—"}${row.status === "scheduled" ? "" : ` (${row.recipients})`}` },
                    { key: "status", label: "Status", render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
                    { key: "sent", label: "Delivered", render: (row) => (row.status === "scheduled" ? "—" : `${row.stats.sent} / ${row.stats.total}`) },
                    { key: "open", label: "Open Rate", render: (row) => (row.openRate == null ? "—" : `${row.openRate}%`) },
                    { key: "click", label: "Click Rate", render: (row) => (row.clickRate == null ? "—" : `${row.clickRate}%`) },
                    { key: "schedule", label: "Schedule", render: (row) => formatWhen(row.sentAt ?? row.scheduledAt) },
                  ]}
                />
              )}
            </Card>
            <Card title="Recent Delivery Issues" action={<CardLink onClick={onViewIssues}>View all</CardLink>}>
              {issues.length ? <StackedList items={issues} /> : <p className="text-sm text-light-black">No failed or skipped emails.</p>}
            </Card>
          </>
        }
        side={
          <>
            <Card title="Quick Actions">
              <div className="space-y-3">
                <button type="button" onClick={onCreateCampaign} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer">
                  Create Campaign
                </button>
                <button type="button" onClick={onCreateSegment} className={outlineButton}>Create Segment</button>
                <button type="button" onClick={onViewAnalytics} className={outlineButton}>View Analytics</button>
              </div>
            </Card>
            <Card title="Best Send Time">
              <p className="text-sm text-light-black">Worked out from opens once an email service reports them.</p>
            </Card>
          </>
        }
      />
    </div>
  );
}

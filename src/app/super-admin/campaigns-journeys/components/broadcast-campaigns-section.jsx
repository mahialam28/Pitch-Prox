"use client";

import React from "react";
import { showExportStartedToast } from "@/lib/toast";
import { Badge, Card, CardLink, DashboardGrid, DataTable, KpiRow, StackedList } from "@/components/shared/dashboard-ui";

// Broadcast Campaigns overview (design only, sample data).

const KPIS = [
  { label: "Campaigns Sent (30 days)", value: "24", note: "4 from last month", trend: "up" },
  { label: "Emails Delivered", value: "96,420", note: "98.1% delivered" },
  { label: "Avg. Open Rate", value: "44.8%", note: "2.1% from last month", trend: "up" },
  { label: "Avg. Click Rate", value: "8.6%", note: "0.8% from last month", trend: "up" },
  { label: "Unsubscribe Rate", value: "0.4%", note: "0.1% from last month", trend: "down" },
];

const CAMPAIGNS = [
  { name: "Product Update - May", type: "Newsletter", audience: "All active users", status: "Scheduled", sent: "-", open: "-", click: "-", schedule: "May 20, 2025 · 9:00 AM" },
  { name: "Trial Reminder Push", type: "Promotional", audience: "Trial users (186)", status: "Sent", sent: "3,420", open: "48.2%", click: "9.1%", schedule: "May 14, 2025 · 10:00 AM" },
  { name: "Win-back Offer", type: "Promotional", audience: "Inactive 30+ days", status: "Sent", sent: "1,204", open: "31.5%", click: "5.2%", schedule: "May 10, 2025 · 2:00 PM" },
  { name: "Playbook Launch: SPIN Selling", type: "Announcement", audience: "Premium prospects", status: "Draft", sent: "-", open: "-", click: "-", schedule: "Not scheduled" },
  { name: "Calibration Reminder", type: "Transactional", audience: "Not calibrated (412)", status: "Sent", sent: "892", open: "55.1%", click: "12.4%", schedule: "May 06, 2025 · 9:00 AM" },
  { name: "Billing Update Notice", type: "Transactional", audience: "Pro plan users", status: "Paused", sent: "-", open: "-", click: "-", schedule: "On hold" },
];

const STATUS_TONE = { Scheduled: "blue", Sent: "green", Draft: "gray", Paused: "amber" };

const ISSUES = [
  { title: "Win-back Offer", subtitle: "42 bounced · 18 unsubscribed", badge: { tone: "amber", label: "May 10" } },
  { title: "Trial Reminder Push", subtitle: "12 blocked as spam", badge: { tone: "amber", label: "May 14" } },
];

const SEND_TIMES = [
  { title: "Tuesday", subtitle: "4:00 PM - 6:00 PM", badge: { tone: "green", label: "48% open" } },
  { title: "Thursday", subtitle: "10:00 AM - 12:00 PM", badge: { tone: "green", label: "45% open" } },
  { title: "Monday", subtitle: "9:00 AM - 11:00 AM", badge: { tone: "blue", label: "41% open" } },
];

const outlineButton = "w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 cursor-pointer";

export default function BroadcastCampaignsSection({ onCreateCampaign, onCreateSegment, onViewAnalytics, onViewIssues }) {
  return (
    <div className="flex flex-col gap-5 font-secondary">
      <KpiRow kpis={KPIS} />
      <DashboardGrid
        main={
          <>
            <Card title="Broadcast Campaigns" action={<CardLink onClick={showExportStartedToast}>Export</CardLink>}>
              <DataTable
                rowKey={(row) => row.name}
                rows={CAMPAIGNS}
                columns={[
                  {
                    key: "name",
                    label: "Campaign",
                    render: (row) => (
                      <span>
                        <span className="block font-medium text-dark-black">{row.name}</span>
                        <span className="block text-[11px] text-light-black">{row.type}</span>
                      </span>
                    ),
                  },
                  { key: "audience", label: "Audience" },
                  { key: "status", label: "Status", render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
                  { key: "sent", label: "Sent" },
                  { key: "open", label: "Open Rate" },
                  { key: "click", label: "Click Rate" },
                  { key: "schedule", label: "Schedule" },
                ]}
              />
            </Card>
            <Card title="Recent Delivery Issues" action={<CardLink onClick={onViewIssues}>View all</CardLink>}>
              <StackedList items={ISSUES} />
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
              <StackedList items={SEND_TIMES} />
            </Card>
          </>
        }
      />
    </div>
  );
}

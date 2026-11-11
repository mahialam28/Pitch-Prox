"use client";

import React, { useEffect, useState } from "react";
import { Badge, Card, CardLink, DashboardGrid, DataTable, KpiRow, PageHeader, Person, Progress, StackedList } from "@/components/shared/dashboard-ui";
import { apiRequest, formatDate } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const BASE = "/super-admin/compliance-audit";
const pct = (value) => (value === null || value === undefined ? "—" : `${value}%`);
const day = (value) => new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const QUICK_LINKS = [
  { title: "Policy Documents", href: `${BASE}/policy-documents` },
  { title: "Training Logs", href: `${BASE}/training-logs` },
  { title: "Incident Management", href: `${BASE}/incident-management` },
  { title: "Audit Logs", href: `${BASE}/audit-logs` },
  { title: "SOC 2 Readiness", href: `${BASE}/soc2-readiness` },
  { title: "Evidence Repository", href: `${BASE}/evidence-repository` },
];

// Compliance Overview: every number comes from the other Compliance pages (/api/v1/compliance/overview)
export default function ComplianceOverviewPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    apiRequest("/api/v1/compliance/overview").then(setData).catch((error) => showError("Overview not loaded", error.message));
  }, []);

  const kpis = data?.kpis;
  const KPIS = [
    { label: "Compliance Score", value: pct(kpis?.score), note: "Signatures, training, evidence and SOC 2", good: kpis?.score != null ? kpis.score >= 85 : undefined },
    { label: "Policies Approved", value: kpis ? `${kpis.policiesApproved} / ${kpis.policiesTotal}` : "—", note: `${pct(kpis?.ackRate)} acknowledged` },
    { label: "Training Completion", value: pct(kpis?.trainingRate), note: "All assignments", good: kpis?.trainingRate != null ? kpis.trainingRate >= 85 : undefined },
    { label: "Active Incidents", value: kpis ? kpis.activeIncidents : "—", note: kpis ? `${kpis.criticalHigh} Critical / High` : "", good: kpis ? kpis.criticalHigh === 0 : undefined },
    { label: "Audit Readiness", value: pct(kpis?.readiness), note: kpis ? `${kpis.openGaps} SOC 2 gap${kpis.openGaps === 1 ? "" : "s"}` : "", good: kpis ? kpis.readiness >= 85 : undefined },
  ];

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <PageHeader title="Compliance Overview" subtitle="Track compliance posture, deadlines and items that need attention." />
      <KpiRow kpis={KPIS} />
      <DashboardGrid
        main={
          <>
            <Card title="Compliance Posture by Area" action={<CardLink href={`${BASE}/policy-documents`}>View all policies</CardLink>}>
              {data && !data.areas.length ? (
                <p className="text-xs text-medium-black">No approved policies yet.</p>
              ) : (
                <DataTable
                  rowKey={(row) => row.area}
                  rows={data?.areas ?? []}
                  columns={[
                    { key: "area", label: "Area" },
                    { key: "owner", label: "Owner", render: (row) => (row.owner ? <Person name={row.owner} role={`${row.policies} polic${row.policies === 1 ? "y" : "ies"}`} /> : `${row.policies} polic${row.policies === 1 ? "y" : "ies"}`) },
                    { key: "score", label: "Signed", render: (row) => <Progress value={row.score} tone={row.score < 85 ? "bg-amber-500" : "bg-primary"} /> },
                    { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "Compliant" ? "green" : "amber"}>{row.reviewsDue ? `Review overdue (${row.reviewsDue})` : row.status}</Badge> },
                    { key: "lastApproved", label: "Last Approved", render: (row) => formatDate(row.lastApproved) },
                  ]}
                />
              )}
            </Card>
            <Card title="Upcoming Deadlines" action={<CardLink href="/super-admin/calendar-announcements">View calendar</CardLink>}>
              {data && !data.deadlines.length ? (
                <p className="text-xs text-medium-black">Nothing due in the next 60 days.</p>
              ) : (
                <StackedList items={(data?.deadlines ?? []).map((item) => ({ title: item.title, subtitle: item.area, badge: { tone: "blue", label: day(item.date) }, href: item.href }))} />
              )}
            </Card>
          </>
        }
        side={
          <>
            <Card title="Needs Attention">
              <StackedList items={(data?.attention ?? []).map((item) => ({ title: item.title, subtitle: item.subtitle, badge: { tone: item.count ? item.tone : "green", label: String(item.count) }, href: item.href }))} />
            </Card>
            <Card title="Quick Links">
              <StackedList items={QUICK_LINKS} chevron />
            </Card>
          </>
        }
      />
    </div>
  );
}

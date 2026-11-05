"use client";

import React from "react";
import { Badge, Card, CardLink, DashboardGrid, DataTable, KpiRow, PageHeader, Person, Progress, StackedList } from "@/components/shared/dashboard-ui";

// Design-only Compliance Overview: sample data until the compliance API exists.

const BASE = "/super-admin/compliance-audit";

const KPIS = [
  { label: "Compliance Score", value: "92%", note: "3% from last month", trend: "up" },
  { label: "Policies Approved", value: "22 / 28", note: "2 this month", trend: "up" },
  { label: "Training Completion", value: "93%", note: "4% from last month", trend: "up" },
  { label: "Open Incidents", value: "7", note: "2 from last week", trend: "down" },
  { label: "Audit Readiness", value: "87%", note: "5% from last month", trend: "up" },
];

const AREAS = [
  { area: "Security", owner: "Sarah Johnson", role: "Security Lead", score: 96, status: "Compliant", review: "May 10, 2025" },
  { area: "Access & Identity", owner: "Mike Davis", role: "Operations", score: 92, status: "Compliant", review: "May 08, 2025" },
  { area: "HR & People", owner: "Emily Brown", role: "HR Manager", score: 88, status: "Needs review", review: "Apr 29, 2025" },
  { area: "AI Governance", owner: "Daniel Miller", role: "AI Lead", score: 84, status: "Needs review", review: "May 12, 2025" },
  { area: "Operations", owner: "Tom Wilson", role: "Operations", score: 95, status: "Compliant", review: "May 02, 2025" },
  { area: "Legal & Compliance", owner: "Jessica Lee", role: "Legal", score: 90, status: "Compliant", review: "May 06, 2025" },
];

const DEADLINES = [
  { title: "SOC 2 evidence freeze", subtitle: "Evidence Repository", badge: { tone: "amber", label: "Jun 15" }, href: `${BASE}/evidence-repository` },
  { title: "Annual review: Information Security Policy", subtitle: "Policy Documents", badge: { tone: "blue", label: "Jun 30" }, href: `${BASE}/policy-documents` },
  { title: "Quarterly access review", subtitle: "Access Records", badge: { tone: "blue", label: "Jul 01" }, href: `${BASE}/access-records` },
  { title: "Employee security training renewal", subtitle: "Training Logs", badge: { tone: "blue", label: "Jul 15" }, href: `${BASE}/training-logs` },
];

const ATTENTION = [
  { title: "Overdue policy acknowledgments", subtitle: "Employees past due date", badge: { tone: "red", label: "3" }, href: `${BASE}/policy-documents` },
  { title: "Policies under review", subtitle: "Waiting for approval", badge: { tone: "amber", label: "4" }, href: `${BASE}/policy-documents` },
  { title: "Evidence expiring in 30 days", subtitle: "Evidence Repository", badge: { tone: "amber", label: "12" }, href: `${BASE}/evidence-repository` },
  { title: "Open incidents", subtitle: "Incident Management", badge: { tone: "amber", label: "7" }, href: `${BASE}/incident-management` },
];

const QUICK_LINKS = [
  { title: "Policy Documents", href: `${BASE}/policy-documents` },
  { title: "Training Logs", href: `${BASE}/training-logs` },
  { title: "Incident Management", href: `${BASE}/incident-management` },
  { title: "Audit Logs", href: `${BASE}/audit-logs` },
  { title: "Evidence Repository", href: `${BASE}/evidence-repository` },
];

export default function ComplianceOverviewPage() {
  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <PageHeader title="Compliance Overview" subtitle="Track compliance posture, deadlines and items that need attention." />
      <KpiRow kpis={KPIS} />
      <DashboardGrid
        main={
          <>
            <Card title="Compliance Posture by Area" action={<CardLink href={`${BASE}/policy-documents`}>View all policies</CardLink>}>
              <DataTable
                rowKey={(row) => row.area}
                rows={AREAS}
                columns={[
                  { key: "area", label: "Area" },
                  { key: "owner", label: "Owner", render: (row) => <Person name={row.owner} role={row.role} /> },
                  { key: "score", label: "Score", render: (row) => <Progress value={row.score} tone={row.score < 85 ? "bg-amber-500" : "bg-primary"} /> },
                  { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "Compliant" ? "green" : "amber"}>{row.status}</Badge> },
                  { key: "review", label: "Last Review" },
                ]}
              />
            </Card>
            <Card title="Upcoming Deadlines" action={<CardLink href="/super-admin/calendar-announcements">View calendar</CardLink>}>
              <StackedList items={DEADLINES} />
            </Card>
          </>
        }
        side={
          <>
            <Card title="Needs Attention">
              <StackedList items={ATTENTION} />
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

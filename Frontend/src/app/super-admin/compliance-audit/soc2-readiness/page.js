"use client";

import React, { useState } from "react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { Checkbox, Field, Select, fieldClass } from "@/app/super-admin/users/[id]/components/account-dialogs";
import { showExportStartedToast, showSavedToast } from "@/lib/toast";
import { Badge, Card, CardLink, DashboardGrid, DataTable, KpiRow, PageHeader, Person, Progress, StackedList } from "@/components/shared/dashboard-ui";

// Design-only SOC 2 Readiness dashboard: sample data and a local invite dialog.

const KPIS = [
  { label: "Overall Readiness", value: "87%", note: "5% from last month", trend: "up" },
  { label: "Controls Implemented", value: "118 / 134", note: "88% complete" },
  { label: "Evidence Collected", value: "91%", note: "6% from last month", trend: "up" },
  { label: "Open Gaps", value: "9", note: "3 from last month", trend: "down" },
  { label: "Audit Window Opens", value: "42 days", note: "Fieldwork starts Jul 14" },
];

const CRITERIA = [
  { criteria: "Security", controls: "62 / 64", progress: 98, status: "On track", owner: "Sarah Johnson", role: "Security Lead" },
  { criteria: "Availability", controls: "18 / 20", progress: 90, status: "On track", owner: "Marcus Lee", role: "Engineering" },
  { criteria: "Processing Integrity", controls: "14 / 17", progress: 82, status: "At risk", owner: "Priya Shah", role: "Data Science" },
  { criteria: "Confidentiality", controls: "15 / 17", progress: 88, status: "On track", owner: "Mike Davis", role: "Operations" },
  { criteria: "Privacy", controls: "9 / 16", progress: 56, status: "Behind", owner: "Jessica Lee", role: "Legal" },
];

const STATUS_TONE = { "On track": "green", "At risk": "amber", Behind: "red" };

const GAPS = [
  { control: "CC6.1", gap: "Quarterly access review evidence missing for Q1", owner: "Sarah Johnson", due: "May 30, 2025", severity: "High" },
  { control: "CC7.2", gap: "Incident response tabletop not logged", owner: "Mike Davis", due: "Jun 06, 2025", severity: "Medium" },
  { control: "A1.2", gap: "Backup restore test not documented", owner: "Emily Brown", due: "Jun 10, 2025", severity: "Medium" },
  { control: "C1.1", gap: "Data classification policy awaiting approval", owner: "Daniel Miller", due: "Jun 12, 2025", severity: "Low" },
  { control: "P4.1", gap: "Retention schedule not mapped to systems", owner: "Tom Wilson", due: "Jun 20, 2025", severity: "Medium" },
];

const SEVERITY_TONE = { High: "red", Medium: "amber", Low: "green" };

const TIMELINE = [
  { title: "Readiness assessment", subtitle: "Completed May 02, 2025", badge: { tone: "green", label: "Done" } },
  { title: "Evidence freeze", subtitle: "Jun 15, 2025", badge: { tone: "amber", label: "Upcoming" } },
  { title: "Auditor fieldwork", subtitle: "Jul 14 - Jul 28, 2025", badge: { tone: "blue", label: "Planned" } },
  { title: "Report issued", subtitle: "Aug 15, 2025", badge: { tone: "blue", label: "Planned" } },
];

const SCOPES = ["Controls", "Evidence Repository", "Policy Documents", "Audit Logs"];

const InviteAuditorModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [firm, setFirm] = useState("");
  const [expiry, setExpiry] = useState("Until report is issued");
  const [scopes, setScopes] = useState(SCOPES.slice(0, 2));
  const validEmail = /^\S+@\S+\.\S+$/.test(email);

  const toggle = (scope, checked) => setScopes((current) => (checked ? [...current, scope] : current.filter((item) => item !== scope)));

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Auditor"
      subtitle="Auditors get read-only access to the areas you choose."
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={!validEmail || !scopes.length}
            onClick={() => {
              onClose();
              showSavedToast("Auditor invited", `${email} will get a read-only access link.`);
            }}
          >
            Send Invite
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Auditor email" htmlFor="auditor-email">
          <input id="auditor-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="auditor@firm.com" className={fieldClass} />
        </Field>
        <Field label="Audit firm (optional)" htmlFor="auditor-firm">
          <input id="auditor-firm" value={firm} onChange={(event) => setFirm(event.target.value)} placeholder="e.g., Prescient Assurance" className={fieldClass} />
        </Field>
        <Field label="Access expires" htmlFor="auditor-expiry">
          <Select id="auditor-expiry" value={expiry} onChange={setExpiry} options={["Until report is issued", "30 days", "60 days", "90 days"]} />
        </Field>
        <div>
          <p className="block text-xs font-medium leading-4 text-medium-black mb-2">Read-only access to</p>
          <div className="grid grid-cols-2 gap-3">
            {SCOPES.map((scope) => (
              <Checkbox key={scope} checked={scopes.includes(scope)} onChange={(checked) => toggle(scope, checked)}>{scope}</Checkbox>
            ))}
          </div>
        </div>
      </div>
    </DialogModal>
  );
};

export default function Soc2ReadinessPage() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <PageHeader title="SOC 2 Readiness" subtitle="Monitor control implementation, evidence collection and audit timeline." />
      <KpiRow kpis={KPIS} />
      <DashboardGrid
        main={
          <>
            <Card title="Trust Services Criteria" action={<CardLink href="/super-admin/compliance-audit/evidence-repository">View controls</CardLink>}>
              <DataTable
                rowKey={(row) => row.criteria}
                rows={CRITERIA}
                columns={[
                  { key: "criteria", label: "Criteria" },
                  { key: "controls", label: "Controls" },
                  { key: "progress", label: "Progress", render: (row) => <Progress value={row.progress} /> },
                  { key: "status", label: "Status", render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
                  { key: "owner", label: "Owner", render: (row) => <Person name={row.owner} role={row.role} /> },
                ]}
              />
            </Card>
            <Card title="Open Gaps" action={<CardLink onClick={showExportStartedToast}>Export</CardLink>}>
              <DataTable
                rowKey={(row) => row.control}
                rows={GAPS}
                columns={[
                  { key: "control", label: "Control" },
                  { key: "gap", label: "Gap" },
                  { key: "owner", label: "Owner" },
                  { key: "due", label: "Due" },
                  { key: "severity", label: "Severity", render: (row) => <Badge tone={SEVERITY_TONE[row.severity]}>{row.severity}</Badge> },
                ]}
              />
            </Card>
          </>
        }
        side={
          <>
            <Card title="Audit Timeline">
              <StackedList items={TIMELINE} />
            </Card>
            <Card title="Auditor Access">
              <p className="text-xs text-medium-black">Give your external auditor read-only access to controls and evidence.</p>
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="mt-4 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer"
              >
                Invite Auditor
              </button>
            </Card>
          </>
        }
      />
      <InviteAuditorModal key={inviteOpen ? "open" : "closed"} isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { Checkbox, Field, Select, fieldClass } from "@/app/super-admin/users/[id]/components/account-dialogs";
import { showExportStartedToast, showSavedToast } from "@/lib/toast";
import { Badge, Card, CardLink, DashboardGrid, DataTable, KpiRow, PageHeader, Person, StackedList } from "@/components/shared/dashboard-ui";

// Design-only AI Ethics & Governance dashboard: sample data and local dialogs.

const KPIS = [
  { label: "AI Policies in Force", value: "8", note: "1 this quarter", trend: "up" },
  { label: "Model Reviews Completed", value: "12 / 14", note: "86% complete" },
  { label: "Bias Checks Passed", value: "96%", note: "2% from last quarter", trend: "up" },
  { label: "Safety Incidents (30 days)", value: "2", note: "1 from last month", trend: "down" },
  { label: "Guardrail Coverage", value: "94%", note: "3% from last month", trend: "up" },
];

const CONTROLS = [
  { control: "Prompt Safety & Guardrails", owner: "Daniel Miller", role: "AI Lead", risk: "Low", status: "Compliant", last: "May 12, 2025", next: "Aug 12, 2025" },
  { control: "Bias & Fairness Review", owner: "Priya Shah", role: "Data Science", risk: "Medium", status: "In review", last: "Apr 30, 2025", next: "Jul 30, 2025" },
  { control: "Call Recording Consent Disclosure", owner: "Jessica Lee", role: "Legal", risk: "High", status: "Compliant", last: "May 06, 2025", next: "Aug 06, 2025" },
  { control: "Human Oversight of AI Coaching", owner: "Sarah Johnson", role: "Security Lead", risk: "Medium", status: "Compliant", last: "May 02, 2025", next: "Aug 02, 2025" },
  { control: "Prompt & Model Change Management", owner: "Marcus Lee", role: "Engineering", risk: "Medium", status: "Action needed", last: "Apr 18, 2025", next: "Jun 18, 2025" },
  { control: "Training Data Privacy", owner: "Mike Davis", role: "Operations", risk: "High", status: "Compliant", last: "May 09, 2025", next: "Aug 09, 2025" },
];

const RISK_TONE = { Low: "green", Medium: "amber", High: "red" };
const STATUS_TONE = { Compliant: "green", "In review": "blue", "Action needed": "red" };

const REVIEWS = [
  { title: "Objection handling prompts reviewed", subtitle: "Approved by Daniel Miller", badge: { tone: "green", label: "May 12" } },
  { title: "Tone & empathy model bias check", subtitle: "2 findings, 1 resolved", badge: { tone: "amber", label: "Apr 30" } },
  { title: 'Playbook "SPIN Selling" safety review', subtitle: "Approved by Priya Shah", badge: { tone: "green", label: "Apr 22" } },
];

const PRINCIPLES = ["Transparency", "Fairness", "Privacy", "Human oversight", "Accountability"].map((title) => ({
  title,
  subtitle: "Reviewed May 2025",
  badge: { tone: "green", label: "On track" },
}));

const CONCERN_TYPES = ["Unsafe or harmful guidance", "Biased or unfair response", "Missing AI / recording disclosure", "Privacy concern", "Other"];

const ReportConcernModal = ({ isOpen, onClose }) => {
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const valid = type && details.trim().length >= 10;

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Report an AI Concern"
      subtitle="The AI governance team reviews every report within 2 business days."
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={!valid}
            onClick={() => {
              onClose();
              showSavedToast("Concern reported", "The governance team will follow up on your report.");
            }}
          >
            Submit Report
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="What happened?" htmlFor="concern-type">
          <Select id="concern-type" value={type} onChange={setType} options={CONCERN_TYPES} placeholder="Select a concern type" />
        </Field>
        <Field label="Details" htmlFor="concern-details">
          <textarea
            id="concern-details"
            rows={4}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Describe the AI guidance, the call or playbook involved, and when it happened"
            className={`${fieldClass} resize-none`}
          />
        </Field>
        <Checkbox checked={anonymous} onChange={setAnonymous}>Submit anonymously</Checkbox>
      </div>
    </DialogModal>
  );
};

export default function AIGovernancePage() {
  const [concernOpen, setConcernOpen] = useState(false);

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <PageHeader title="AI Ethics & Governance" subtitle="Oversee AI policies, model reviews and responsible-use controls." />
      <KpiRow kpis={KPIS} />
      <DashboardGrid
        main={
          <>
            <Card title="AI Governance Controls" action={<CardLink onClick={showExportStartedToast}>Export</CardLink>}>
              <DataTable
                rowKey={(row) => row.control}
                rows={CONTROLS}
                columns={[
                  { key: "control", label: "Control" },
                  { key: "owner", label: "Owner", render: (row) => <Person name={row.owner} role={row.role} /> },
                  { key: "risk", label: "Risk", render: (row) => <Badge tone={RISK_TONE[row.risk]}>{row.risk}</Badge> },
                  { key: "status", label: "Status", render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
                  { key: "last", label: "Last Review" },
                  { key: "next", label: "Next Review" },
                ]}
              />
            </Card>
            <Card title="Recent AI Reviews" action={<CardLink href="/super-admin/compliance-audit/audit-logs">View all</CardLink>}>
              <StackedList items={REVIEWS} />
            </Card>
          </>
        }
        side={
          <>
            <Card title="Ethics Principles">
              <StackedList items={PRINCIPLES} />
            </Card>
            <Card title="Report an AI Concern">
              <p className="text-xs text-medium-black">See something unsafe, biased or unclear in AI guidance? Report it to the governance team.</p>
              <button
                type="button"
                onClick={() => setConcernOpen(true)}
                className="mt-4 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal cursor-pointer"
              >
                Report Concern
              </button>
            </Card>
          </>
        }
      />
      <ReportConcernModal key={concernOpen ? "open" : "closed"} isOpen={concernOpen} onClose={() => setConcernOpen(false)} />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Rocket, Trash2 } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import RadioCards from "@/components/shared/radio-cards";

// Journey builder dialogs (live; the builder page does the saving)

const labelClass = "block text-xs font-medium leading-4 text-medium-black mb-2";
const fieldClass = "w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-300 bg-white text-base text-dark-black placeholder:text-gray-500 outline-none focus:border-primary transition-colors";

export const PublishJourneyModal = ({ isOpen, onClose, journeyName, stepCount, audienceName = "All Eligible Users", audienceSize, onConfirm }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Publish this journey?"
    icon={Rocket}
    iconTone="primary"
    message={`"${journeyName}" has ${stepCount} steps. Users in ${audienceName} (${audienceSize} now) who meet the trigger will enter automatically on the next run (every few minutes).`}
    note="Emails are queued and delivered once an email service is connected. You can pause the journey at any time."
    confirmLabel="Publish Journey"
    confirmVariant="primary"
    onConfirm={onConfirm}
  />
);

export const DeleteStepModal = ({ step, onClose, onConfirm }) => (
  <ConfirmDialog
    isOpen={Boolean(step)}
    onClose={onClose}
    title="Delete this step?"
    icon={Trash2}
    message={`"${step?.title ?? ""}${step?.subtitle && step?.type === "email" ? `: ${step.subtitle}` : ""}" will be removed. The steps before and after it are reconnected.`}
    note={step?.type === "condition" ? "Its Yes and No branches are removed too." : "Save the journey to keep the change."}
    confirmLabel="Delete Step"
    onConfirm={() => onConfirm?.(step)}
  />
);

// Queues each email step to a staff address (rendered for a chosen customer, or sample values)
export const TestJourneyModal = ({ isOpen, onClose, users = [], defaultEmail = "", onSend }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [userId, setUserId] = useState("");
  const [sending, setSending] = useState(false);
  const validEmail = /^\S+@\S+\.\S+$/.test(email);

  const send = async () => {
    setSending(true);
    try {
      await onSend?.({ email, userId: userId || null });
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Test Journey"
      subtitle="Get every email in this journey at once, filled in for one user."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={send} disabled={!validEmail || sending}>{sending ? "Queuing…" : "Send Test"}</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="test-email" className={labelClass}>Send test emails to</label>
          <input id="test-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="test-user" className={labelClass}>Fill merge fields for</label>
          <select id="test-user" value={userId} onChange={(event) => setUserId(event.target.value)} className={`${fieldClass} cursor-pointer`}>
            <option value="">Sample user (Jordan Lee)</option>
            {users.slice(0, 300).map((user) => (
              <option key={user.id} value={user.id}>{user.name} · {user.company} ({user.plan})</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-medium-black">Wait steps are skipped and conditions aren&apos;t checked: you get every email step. Tests are marked [Test] and delivered once an email service is connected.</p>
      </div>
    </DialogModal>
  );
};

// Journey Audience (item 265): All Eligible Users, a Dynamic Segment or a Static Segment.
// audienceOptions: [{ value, label, kind, count, audience }]
export const audienceOptionsFrom = (segments = [], userCount = 0) => [
  { value: "all", label: "All Eligible Users", kind: "All Eligible Users", count: userCount, audience: { type: "All Eligible Users" } },
  ...segments.map((segment) => ({ value: segment.id, label: segment.name, kind: `${segment.type} Segment`, count: segment.memberCount, audience: { type: `${segment.type} Segment`, segmentId: segment.id } })),
];

export const ChooseAudienceModal = ({ isOpen, onClose, value, options = [], onSave }) => {
  const [selected, setSelected] = useState(value);
  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Audience"
      subtitle="Who should enter this journey when the trigger happens?"
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            onClick={() => {
              onSave(selected);
              onClose();
            }}
          >
            Save Audience
          </DialogButton>
        </>
      }
    >
      <div className="max-h-[360px] overflow-y-auto">
        <RadioCards
          label="Audience"
          value={selected}
          onChange={setSelected}
          options={options.map((audience) => ({ value: audience.value, label: audience.label, description: `${audience.kind} · ${audience.count.toLocaleString("en-US")} users` }))}
        />
      </div>
    </DialogModal>
  );
};

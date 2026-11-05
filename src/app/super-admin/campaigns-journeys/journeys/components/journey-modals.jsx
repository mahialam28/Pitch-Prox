"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Rocket, Trash2 } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import RadioCards from "@/components/shared/radio-cards";
import { SAVED_SEGMENTS, PLATFORM_USERS, membersOf } from "../../user-segments";

// Design-only dialogs for the journey builder: nothing is published or emailed.

const labelClass = "block text-xs font-medium leading-4 text-medium-black mb-2";
const fieldClass =
  "w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-300 bg-white text-base text-dark-black placeholder:text-gray-500 outline-none focus:border-primary transition-colors";

const SAMPLE_LEADS = PLATFORM_USERS.slice(0, 4).map((user) => `${user.name} (${user.plan})`);

const Select = ({ id, value, onChange, options }) => (
  <div className="relative">
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} appearance-none pr-10 cursor-pointer`}>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    <ChevronDown className="w-[18px] h-[18px] text-dark-black/70 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

export const PublishJourneyModal = ({ isOpen, onClose, journeyName, stepCount, audienceName = "All Eligible Users", audienceSize, onConfirm }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Publish this journey?"
    icon={Rocket}
    iconTone="primary"
    message={`"${journeyName}" has ${stepCount} steps and will start sending to ${audienceName.toLowerCase()} (about ${audienceSize} users) immediately.`}
    note="You can pause the journey at any time from Lifecycle Journeys."
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
    note="This can't be undone."
    confirmLabel="Delete Step"
    onConfirm={() => onConfirm?.(step)}
  />
);

export const TestJourneyModal = ({ isOpen, onClose, steps, defaultEmail, onSend }) => {
  const stepOptions = steps.map((step, index) => `Step ${index + 1}: ${step.title}`);
  const [email, setEmail] = useState(defaultEmail);
  const [startStep, setStartStep] = useState(stepOptions[0] ?? "");
  const [lead, setLead] = useState(SAMPLE_LEADS[0]);
  const [skipWaits, setSkipWaits] = useState(true);
  const validEmail = /^\S+@\S+\.\S+$/.test(email);

  const send = () => {
    onClose();
    onSend?.({ email, startStep, lead, skipWaits });
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Test Journey"
      subtitle="Send test emails to check how the journey looks."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={send} disabled={!validEmail}>Send Test</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="test-email" className={labelClass}>Send test to</label>
          <input id="test-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="test-step" className={labelClass}>Start from step</label>
          <Select id="test-step" value={startStep} onChange={setStartStep} options={stepOptions} />
        </div>
        <div>
          <label htmlFor="test-lead" className={labelClass}>Use sample user</label>
          <Select id="test-lead" value={lead} onChange={setLead} options={SAMPLE_LEADS} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={skipWaits} onChange={(event) => setSkipWaits(event.target.checked)} className="sr-only peer" />
          <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
            {skipWaits && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </span>
          <span className="text-sm text-medium-black">Skip wait steps during the test</span>
        </label>
      </div>
    </DialogModal>
  );
};

// Journey Audience: All Eligible Users, a Dynamic Segment or a Static Segment.
// Users who meet the trigger and audience rules enter the journey automatically.
export const AUDIENCES = [
  { value: "all", label: "All Eligible Users", kind: "All Eligible Users", count: PLATFORM_USERS.length },
  ...SAVED_SEGMENTS.map((segment) => ({ value: `segment-${segment.id}`, label: segment.name, kind: `${segment.type ?? "Dynamic"} Segment`, count: membersOf(segment).length })),
];

export const ChooseAudienceModal = ({ isOpen, onClose, value, onSave }) => {
  const [selected, setSelected] = useState(value);
  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Audience"
      subtitle="Who should enter this journey?"
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
          options={AUDIENCES.map((audience) => ({ value: audience.value, label: audience.label, description: `${audience.kind} · ${audience.count.toLocaleString("en-US")} users` }))}
        />
      </div>
    </DialogModal>
  );
};

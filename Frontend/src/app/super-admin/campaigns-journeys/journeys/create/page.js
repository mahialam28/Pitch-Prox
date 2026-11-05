"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, Plus, Target, Triangle, UsersRound } from "lucide-react";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import { showSavedToast } from "@/lib/toast";
import StepSettingsPanel from "../components/step-settings-panel";
import { PublishJourneyModal, TestJourneyModal, DeleteStepModal, ChooseAudienceModal, AUDIENCES } from "../components/journey-modals";
import {
  STEP_TYPES,
  ADDABLE_TYPES,
  INITIAL_STEPS,
  createStep,
  findStep,
  updateStep,
  removeStep,
  insertStep,
  moveStep,
} from "../components/journey-steps";

// Design-only journey builder: every change lives in local state; nothing is saved,
// published or emailed.

const JOURNEY_NAME = "Trial Onboarding Journey";

const Connector = ({ className = "h-5" }) => <span aria-hidden className={`block w-px bg-gray-300 ${className}`} />;

const AddStepButton = ({ onAdd }) => (
  <ActionMenu
    label="Add step"
    heading="Choose a step"
    width={200}
    triggerClassName="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-gray-300 bg-white text-[11px] font-semibold text-primary hover:border-primary transition-colors cursor-pointer"
    trigger={
      <>
        <Plus className="w-3.5 h-3.5" /> Add Step
      </>
    }
    items={ADDABLE_TYPES.map((type) => ({
      label: STEP_TYPES[type].label,
      icon: STEP_TYPES[type].icon,
      tone: STEP_TYPES[type].tone,
      danger: type === "end",
      onClick: () => onAdd(type),
    }))}
  />
);

const StepCard = ({ step, selected, onSelect, onMove, canMoveUp, canMoveDown, compact }) => {
  const meta = STEP_TYPES[step.type];
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(step.id)}
      onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && (event.preventDefault(), onSelect(step.id))}
      className={`w-full flex items-center gap-3 bg-white rounded-xl border px-3.5 py-3 text-left cursor-pointer transition-all ${
        selected ? "border-primary ring-2 ring-primary/15" : "border-light-gray hover:border-primary/40 shadow-xs"
      }`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.tone}`}>
        <meta.icon className="w-4 h-4" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-dark-black truncate">{step.title}</span>
        {step.subtitle && <span className="block text-[11px] text-light-black truncate">{step.subtitle}</span>}
      </span>
      {compact ? (
        <ChevronDown className="w-4 h-4 text-dark-black/70 shrink-0" />
      ) : (
        <span className="flex items-center gap-0.5 shrink-0" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            aria-label={`Move ${step.title} up`}
            disabled={!canMoveUp}
            onClick={() => onMove(step.id, -1)}
            className="p-1 rounded text-dark-black/70 hover:bg-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={`Move ${step.title} down`}
            disabled={!canMoveDown}
            onClick={() => onMove(step.id, 1)}
            className="p-1 rounded text-dark-black/70 hover:bg-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </span>
      )}
    </div>
  );
};

const Branch = ({ label, tone, steps, selectedId, onSelect, onAdd }) => (
  <div className="flex flex-col items-center min-w-0">
    <Connector className="h-6" />
    <span className={`text-xs font-semibold ${tone}`}>{label}</span>
    <Connector className="h-6" />
    {steps.map((step) => (
      <Fragment key={step.id}>
        <StepCard step={step} compact selected={selectedId === step.id} onSelect={onSelect} />
        <Connector />
      </Fragment>
    ))}
    <AddStepButton onAdd={(type) => onAdd(steps.length - 1, type)} />
    <Connector className="h-6" />
  </div>
);

const SummaryCard = ({ icon: Icon, tone, label, value, onEdit }) => (
  <div className="flex items-center gap-3 bg-white rounded-xl border border-light-gray px-4 py-3.5 min-w-0">
    <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
      <Icon className="w-4 h-4" />
    </span>
    <span className="flex-1 min-w-0">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-light-black">{label}</span>
      <span className="block text-sm font-semibold text-dark-black truncate">{value}</span>
    </span>
    <button type="button" onClick={onEdit} aria-label={`Edit ${label.toLowerCase()}`} className="p-1.5 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray cursor-pointer">
      <Pencil className="w-3.5 h-3.5" />
    </button>
  </div>
);

export default function CreateJourneyPage() {
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [selectedId, setSelectedId] = useState("email-1");
  const [status, setStatus] = useState("Draft");
  const [testOpen, setTestOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [audienceId, setAudienceId] = useState("trial");
  const [audienceOpen, setAudienceOpen] = useState(false);
  const audience = AUDIENCES.find((item) => item.value === audienceId) ?? AUDIENCES[0];
  const audienceSize = audience.count.toLocaleString("en-US");

  const selected = selectedId ? findStep(steps, selectedId) : null;
  const trigger = steps[0];
  const goal = steps.find((step) => step.type === "goal");

  const addStep = (location, type) => {
    const step = createStep(type);
    setSteps((prev) => insertStep(prev, location, step));
    setSelectedId(step.id);
  };

  const saveStep = (id, changes) => {
    setSteps((prev) => updateStep(prev, id, changes));
    showSavedToast("Step saved", "Your changes are in the draft. Publish the journey to start sending.");
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-dark-black">{JOURNEY_NAME}</h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-light-gray text-medium-black"
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-sm text-medium-black mt-1">Welcome and activate new trial users.</p>
          <Link
            href="/super-admin/campaigns-journeys?tab=lifecycle-journeys"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lifecycle Journeys
          </Link>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => showSavedToast("Draft saved", `${JOURNEY_NAME} was saved as a draft.`)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => setTestOpen(true)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
          >
            Test Journey
          </button>
          <button
            type="button"
            onClick={() => setPublishOpen(true)}
            disabled={status === "Active"}
            className="px-4 py-2.5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-medium-teal transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "Active" ? "Published" : "Publish Journey"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard icon={Triangle} tone="bg-emerald-50 text-emerald-600" label="Entry trigger" value={trigger.title} onEdit={() => setSelectedId(trigger.id)} />
            <SummaryCard icon={UsersRound} tone="bg-indigo-50 text-indigo-500" label="Audience" value={audience.label} onEdit={() => setAudienceOpen(true)} />
            <SummaryCard
              icon={Target}
              tone="bg-purple-50 text-purple-600"
              label="Goal"
              value={goal ? goal.title.replace(/\?$/, "") : "No goal set"}
              onEdit={() => goal && setSelectedId(goal.id)}
            />
          </div>

          {/* Canvas */}
          <div className="overflow-x-auto py-4">
            <div className="flex flex-col items-center min-w-[520px]">
              {steps.map((step, index) => {
                const meta = STEP_TYPES[step.type];
                return (
                  <Fragment key={step.id}>
                    <div className="relative w-full max-w-[340px]">
                      <span className={`absolute -left-12 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center ${meta.badge}`}>
                        {index + 1}
                      </span>
                      <StepCard
                        step={step}
                        selected={selectedId === step.id}
                        onSelect={setSelectedId}
                        onMove={(id, direction) => setSteps((prev) => moveStep(prev, id, direction))}
                        canMoveUp={index > 1}
                        canMoveDown={index > 0 && index < steps.length - 1}
                      />
                    </div>

                    {step.type === "condition" ? (
                      <div className="grid grid-cols-2 gap-6 w-full max-w-[460px]">
                        {["yes", "no"].map((side) => (
                          <Branch
                            key={side}
                            label={side === "yes" ? "Yes" : "No"}
                            tone={side === "yes" ? "text-primary" : "text-red-500"}
                            steps={step.branches[side]}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onAdd={(afterIndex, type) => addStep({ parentId: step.id, side, index: afterIndex }, type)}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <Connector />
                        <AddStepButton onAdd={(type) => addStep({ parentId: null, index }, type)} />
                        <Connector className={index === steps.length - 1 ? "h-8" : "h-5"} />
                      </>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {selected ? (
          <StepSettingsPanel
            key={selected.id}
            step={selected}
            audienceSize={audienceSize}
            onClose={() => setSelectedId(null)}
            onSave={saveStep}
            onDelete={setDeleting}
          />
        ) : (
          <aside className="bg-white rounded-2xl border border-dashed border-light-gray p-6 text-center text-sm text-medium-black xl:sticky xl:top-6">
            Select a step to edit its settings.
          </aside>
        )}
      </div>

      <TestJourneyModal
        key={testOpen ? "test-open" : "test-closed"}
        isOpen={testOpen}
        onClose={() => setTestOpen(false)}
        steps={steps}
        defaultEmail="daniel@pitchprox.com"
        onSend={({ email }) => showSavedToast("Test sent", `Test emails are on their way to ${email}.`)}
      />

      <PublishJourneyModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        journeyName={JOURNEY_NAME.replace(/ Journey$/, "")}
        stepCount={steps.length}
        audienceName={audience.label}
        audienceSize={audienceSize}
        onConfirm={() => {
          setStatus("Active");
          showSavedToast("Journey published", `${JOURNEY_NAME} is now sending to new trial users.`);
        }}
      />

      <ChooseAudienceModal
        key={audienceOpen ? "audience-open" : "audience-closed"}
        isOpen={audienceOpen}
        onClose={() => setAudienceOpen(false)}
        value={audienceId}
        onSave={(id) => {
          setAudienceId(id);
          showSavedToast("Audience updated", `${AUDIENCES.find((item) => item.value === id)?.label} will enter this journey.`);
        }}
      />

      <DeleteStepModal
        step={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={(step) => {
          setSteps((prev) => removeStep(prev, step.id));
          if (selectedId === step.id) setSelectedId(null);
        }}
      />
    </div>
  );
}

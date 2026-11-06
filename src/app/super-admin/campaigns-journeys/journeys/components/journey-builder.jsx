"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, Plus, Target, Triangle, UsersRound } from "lucide-react";
import toast from "react-hot-toast";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";
import StepSettingsPanel from "./step-settings-panel";
import { PublishJourneyModal, TestJourneyModal, DeleteStepModal, ChooseAudienceModal, audienceOptionsFrom } from "./journey-modals";
import { STEP_TYPES, ADDABLE_TYPES, NEW_JOURNEY, createStep, findStep, updateStep, removeStep, insertStep, moveStep, nestedTypes, triggerTitle, REENTRY_OPTIONS, EXIT_CONDITIONS, eventByKey } from "./journey-steps";
import { campaignApi, useApi, useCanManage } from "../../campaign-api";

const Connector = ({ className = "h-5" }) => <span aria-hidden className={`block w-px bg-gray-300 ${className}`} />;

const AddStepButton = ({ onAdd, types = ADDABLE_TYPES }) => (
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
    items={types.map((type) => ({ label: STEP_TYPES[type].label, icon: STEP_TYPES[type].icon, tone: STEP_TYPES[type].tone, danger: type === "end", onClick: () => onAdd(type) }))}
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
      className={`w-full flex items-center gap-3 bg-white rounded-xl border px-3.5 py-3 text-left cursor-pointer transition-all ${selected ? "border-primary ring-2 ring-primary/15" : "border-light-gray hover:border-primary/40 shadow-xs"}`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.tone}`}>
        <meta.icon className="w-4 h-4" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-dark-black truncate">{step.title}</span>
        {step.subtitle && <span className={`block text-[11px] truncate ${step.type === "email" && !step.templateId ? "text-amber-600" : "text-light-black"}`}>{step.subtitle}</span>}
      </span>
      {!compact && onMove && (
        <span className="flex items-center gap-0.5 shrink-0" onClick={(event) => event.stopPropagation()}>
          <button type="button" aria-label={`Move ${step.title} up`} disabled={!canMoveUp} onClick={() => onMove(step.id, -1)} className="p-1 rounded text-dark-black/70 hover:bg-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button type="button" aria-label={`Move ${step.title} down`} disabled={!canMoveDown} onClick={() => onMove(step.id, 1)} className="p-1 rounded text-dark-black/70 hover:bg-light-gray disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
            <ChevronDown className="w-4 h-4" />
          </button>
        </span>
      )}
    </div>
  );
};

const Branch = ({ label, tone, steps, selectedId, onSelect, onAdd, editable }) => (
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
    {editable && <AddStepButton types={nestedTypes} onAdd={(type) => onAdd(steps.length - 1, type)} />}
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
    {onEdit && (
      <button type="button" onClick={onEdit} aria-label={`Edit ${label.toLowerCase()}`} className="p-1.5 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray cursor-pointer">
        <Pencil className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

const STATUS_STYLE = { active: "bg-emerald-50 text-emerald-600", paused: "bg-amber-50 text-amber-700", draft: "bg-light-gray text-medium-black" };
const TRIGGER_ID = "trigger";

// The editor: loads `journey` (or NEW_JOURNEY), keeps everything in state, saves through the API
function Editor({ initial, segments, users, templates, plans, canManage }) {
  const router = useRouter();
  const [journeyId, setJourneyId] = useState(initial.id ?? null);
  const [status, setStatus] = useState(initial.status ?? "draft");
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [trigger, setTrigger] = useState(initial.triggerConfig);
  const [audience, setAudience] = useState(initial.audience);
  const [reentry, setReentry] = useState(initial.reentry);
  const [exitConditions, setExitConditions] = useState(initial.exitConditions);
  const [steps, setSteps] = useState(initial.steps);
  const [selectedId, setSelectedId] = useState(TRIGGER_ID);
  const [dialog, setDialog] = useState(null); // test | publish | audience
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const change = (setter) => (value) => {
    setter(value);
    setDirty(true);
  };

  const audienceOptions = audienceOptionsFrom(segments, users.length);
  const audienceValue = audience.type === "All Eligible Users" ? "all" : audience.segmentId;
  const audienceOption = audienceOptions.find((option) => option.value === audienceValue) ?? audienceOptions[0];
  const triggerStep = { id: TRIGGER_ID, type: "trigger", title: triggerTitle(trigger, segments), subtitle: trigger.type };
  const allSteps = [triggerStep, ...steps];
  const selected = selectedId === TRIGGER_ID ? triggerStep : selectedId ? findStep(steps, selectedId) : null;
  const goalStep = steps.find((step) => step.type === "goal");
  const goal = goalStep?.goal ?? initial.goal ?? null;

  const payload = () => ({ name: name.trim(), description, triggerConfig: trigger, audience, reentry, exitConditions, goal, steps });

  const save = async ({ quiet = false } = {}) => {
    if (!name.trim()) {
      toast.error("Give the journey a name.");
      return null;
    }
    setSaving(true);
    try {
      const result = journeyId ? await campaignApi.updateJourney(journeyId, payload()) : await campaignApi.createJourney(payload());
      setDirty(false);
      if (!journeyId) {
        setJourneyId(result.journey.id);
        router.replace(`/super-admin/campaigns-journeys/journeys/${result.journey.id}`);
      }
      if (!quiet) showSavedToast("Journey saved", status === "active" ? "Changes apply to the next steps users reach." : "Saved as a draft.");
      return result.journey;
    } catch (error) {
      showError("Journey not saved", error.message);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const setLive = async (action) => {
    const saved = dirty || !journeyId ? await save({ quiet: true }) : { id: journeyId };
    if (!saved) return;
    try {
      const result = await campaignApi.journeyStatus(saved.id, action);
      setStatus(result.status);
      showSavedToast(action === "pause" ? "Journey paused" : "Journey is live", action === "pause" ? "Nobody new enters and waiting users stay where they are." : "Users who meet the trigger enter on the next run.");
    } catch (error) {
      showError(action === "pause" ? "Not paused" : "Not published", error.message);
    }
  };

  const addStep = (location, type) => {
    const step = createStep(type);
    setSteps((prev) => insertStep(prev, location, step));
    setSelectedId(step.id);
    setDirty(true);
  };

  const applyStep = (id, changes) => {
    if (id === TRIGGER_ID) setTrigger(changes.trigger);
    else setSteps((prev) => updateStep(prev, id, changes));
    setDirty(true);
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              aria-label="Journey name"
              value={name}
              maxLength={160}
              disabled={!canManage}
              onChange={(event) => change(setName)(event.target.value)}
              className="text-2xl font-semibold text-dark-black bg-transparent border-b border-transparent hover:border-light-gray focus:border-primary outline-none min-w-0 w-full max-w-xl"
            />
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLE[status] ?? STATUS_STYLE.draft}`}>{status === "active" ? "Live" : status}</span>
            {dirty && <span className="text-[11px] text-amber-600">Unsaved changes</span>}
          </div>
          <input
            aria-label="Description"
            value={description}
            maxLength={500}
            disabled={!canManage}
            onChange={(event) => change(setDescription)(event.target.value)}
            placeholder="What this journey is for"
            className="text-sm text-medium-black mt-1 bg-transparent outline-none w-full max-w-xl"
          />
          <Link href="/super-admin/campaigns-journeys?tab=lifecycle-journeys" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Lifecycle Journeys
          </Link>
        </div>
        {canManage && (
          <div className="flex items-center gap-3 flex-wrap">
            <button type="button" disabled={saving} onClick={() => save()} className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-dark-black hover:bg-light-gray transition-colors cursor-pointer disabled:opacity-60">
              {status === "active" ? "Save Changes" : "Save Draft"}
            </button>
            <button type="button" disabled={!journeyId} title={journeyId ? "" : "Save the journey first"} onClick={() => setDialog("test")} className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-dark-black hover:bg-light-gray transition-colors cursor-pointer disabled:opacity-50">
              Test Journey
            </button>
            {status === "active" ? (
              <button type="button" onClick={() => setLive("pause")} className="px-4 py-2.5 rounded-lg border border-amber-300 text-sm font-semibold text-amber-700 hover:bg-amber-50 cursor-pointer">
                Pause Journey
              </button>
            ) : (
              <button type="button" onClick={() => setDialog("publish")} className="px-4 py-2.5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-medium-teal transition-colors cursor-pointer">
                {status === "paused" ? "Resume Journey" : "Publish Journey"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard icon={Triangle} tone="bg-emerald-50 text-emerald-600" label="Entry trigger" value={triggerStep.title} onEdit={() => setSelectedId(TRIGGER_ID)} />
            <SummaryCard icon={UsersRound} tone="bg-indigo-50 text-indigo-500" label="Audience" value={`${audienceOption.label} (${audienceOption.count})`} onEdit={canManage ? () => setDialog("audience") : undefined} />
            <SummaryCard icon={Target} tone="bg-purple-50 text-purple-600" label="Goal" value={goal ?? "No goal set"} onEdit={goalStep ? () => setSelectedId(goalStep.id) : undefined} />
          </div>

          <div className="bg-white rounded-xl border border-light-gray px-4 py-4 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-light-black">Journey Re-entry</span>
              <select
                value={reentry.mode}
                disabled={!canManage}
                onChange={(event) => change(setReentry)(event.target.value === "After X Days" ? { mode: event.target.value, days: reentry.days ?? 30 } : { mode: event.target.value })}
                className="h-10 px-3 rounded-lg border border-gray-300 text-sm text-dark-black outline-none focus:border-primary"
              >
                {REENTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {reentry.mode === "After X Days" && (
                <label className="flex items-center gap-2 text-xs text-medium-black">
                  After
                  <input type="number" min={1} max={365} value={reentry.days} disabled={!canManage} onChange={(event) => change(setReentry)({ mode: "After X Days", days: Number(event.target.value) })} className="w-20 h-9 px-2 rounded-lg border border-gray-300 text-sm" />
                  days
                </label>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-light-black">Exit Conditions (a user leaves the journey when…)</span>
              <div className="flex flex-wrap gap-1.5">
                {EXIT_CONDITIONS.map((condition) => {
                  const active = exitConditions.some((item) => item.type === condition);
                  return (
                    <button
                      key={condition}
                      type="button"
                      aria-pressed={active}
                      disabled={!canManage}
                      onClick={() => change(setExitConditions)(active ? exitConditions.filter((item) => item.type !== condition) : [...exitConditions, condition === "Custom User Event" ? { type: condition, event: "user_logged_back_in" } : { type: condition }])}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer ${active ? "bg-primary/10 border-primary text-primary" : "bg-white border-light-gray text-medium-black hover:border-primary/40"}`}
                    >
                      {condition}
                    </button>
                  );
                })}
              </div>
              {exitConditions.some((item) => item.type === "Custom User Event") && (
                <label className="flex items-center gap-2 text-xs text-medium-black">
                  Custom event:
                  <select
                    value={exitConditions.find((item) => item.type === "Custom User Event").event}
                    disabled={!canManage}
                    onChange={(event) => change(setExitConditions)(exitConditions.map((item) => (item.type === "Custom User Event" ? { ...item, event: event.target.value } : item)))}
                    className="h-8 px-2 rounded-lg border border-gray-300 text-xs"
                  >
                    {["user_logged_back_in", "calibration_completed", "plan_upgraded", "plan_downgraded", "subscription_started", "trial_converted", "payment_failed"].map((key) => (
                      <option key={key} value={key}>{eventByKey(key)?.label}</option>
                    ))}
                  </select>
                </label>
              )}
              <p className="text-[11px] text-light-black">Users who match the trigger and audience enter automatically. Before every email the user&apos;s current state is checked again.</p>
            </div>
          </div>

          <div className="overflow-x-auto py-4">
            <div className="flex flex-col items-center min-w-[520px]">
              {allSteps.map((step, index) => {
                const meta = STEP_TYPES[step.type];
                return (
                  <Fragment key={step.id}>
                    <div className="relative w-full max-w-[340px]">
                      <span className={`absolute -left-12 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center ${meta.badge}`}>{index + 1}</span>
                      <StepCard
                        step={step}
                        selected={selectedId === step.id}
                        onSelect={setSelectedId}
                        onMove={canManage && step.type !== "trigger" ? (id, direction) => change(setSteps)(moveStep(allSteps, id, direction).slice(1)) : null}
                        canMoveUp={index > 1}
                        canMoveDown={index > 0 && index < allSteps.length - 1}
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
                            editable={canManage}
                            onAdd={(afterIndex, type) => addStep({ parentId: step.id, side, index: afterIndex }, type)}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <Connector />
                        {canManage && <AddStepButton onAdd={(type) => addStep({ parentId: null, index: index - 1 }, type)} />}
                        <Connector className={index === allSteps.length - 1 ? "h-8" : "h-5"} />
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
            key={`${selected.id}-${selected.id === TRIGGER_ID ? JSON.stringify(trigger) : ""}`}
            step={selected}
            trigger={trigger}
            templates={templates}
            segments={segments}
            plans={plans}
            audienceSize={audienceOption.count}
            readOnly={!canManage}
            onClose={() => setSelectedId(null)}
            onSave={applyStep}
            onDelete={setDeleting}
          />
        ) : (
          <aside className="bg-white rounded-2xl border border-dashed border-light-gray p-6 text-center text-sm text-medium-black xl:sticky xl:top-6">Select a step to edit its settings.</aside>
        )}
      </div>

      {dialog === "test" && (
        <TestJourneyModal
          isOpen
          users={users}
          onClose={() => setDialog(null)}
          onSend={async ({ email, userId }) => {
            try {
              if (dirty) await save({ quiet: true });
              const result = await campaignApi.testJourney(journeyId, { email, userId });
              showSavedToast("Test queued", `${result.emails} test email${result.emails === 1 ? "" : "s"} for ${email}. They're delivered once an email service is connected.`);
            } catch (error) {
              showError("Test not sent", error.message);
              throw error;
            }
          }}
        />
      )}
      <PublishJourneyModal
        isOpen={dialog === "publish"}
        onClose={() => setDialog(null)}
        journeyName={name}
        stepCount={steps.length}
        audienceName={audienceOption.label}
        audienceSize={audienceOption.count}
        onConfirm={() => setLive(status === "paused" ? "resume" : "publish")}
      />
      {dialog === "audience" && (
        <ChooseAudienceModal
          isOpen
          options={audienceOptions}
          value={audienceValue}
          onClose={() => setDialog(null)}
          onSave={(value) => change(setAudience)(audienceOptions.find((option) => option.value === value).audience)}
        />
      )}
      <DeleteStepModal
        step={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={(step) => {
          change(setSteps)(removeStep(steps, step.id));
          if (selectedId === step.id) setSelectedId(null);
        }}
      />
    </div>
  );
}

// journeyId null = new journey
export default function JourneyBuilder({ journeyId = null }) {
  const journey = useApi(journeyId ? `/api/v1/campaigns/journeys/${journeyId}` : null);
  const segments = useApi("/api/v1/campaigns/segments");
  const templates = useApi("/api/v1/campaigns/templates");
  const canManage = useCanManage();
  const ready = segments.data && templates.data && (!journeyId || journey.data);
  if (!ready) return <div className="w-full py-20 text-center text-sm text-light-black">{journey.error ?? segments.error ?? templates.error ?? "Loading journey…"}</div>;
  return (
    <Editor
      key={journeyId ?? "new"}
      initial={journeyId ? journey.data.journey : NEW_JOURNEY}
      segments={segments.data.segments}
      users={segments.data.users}
      plans={segments.data.plans}
      templates={templates.data.results}
      canManage={canManage}
    />
  );
}

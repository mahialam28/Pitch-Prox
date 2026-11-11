"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CalendarDays, CircleCheck, Clock, Eye, Loader2, Menu, X } from "lucide-react";
import whiteLogo from "@/assets/logos/white-logo.png";
import PolicyReviewStep from "./policy-review-step";
import { WelcomeStep, SecurityStep, TrainingStep, FinalStep, VoiceStep, CompleteStep } from "./onboarding-steps";
import { NeedHelp, OnboardingDetails, WhatHappensNext } from "./onboarding-ui";
import { STEPS, VARIANTS } from "./onboarding-data";
import { useOnboarding } from "./use-onboarding";
import { showError } from "@/lib/alerts";

// Employee onboarding. `live` = the signed-in employee's real onboarding (saved
// through /api/v1/onboarding); otherwise an admin preview with sample data.

const StepsSidebar = ({ steps, current, reached, done, onSelect, open, onClose }) => (
  <aside
    className={`fixed inset-y-0 left-0 z-40 w-60 bg-dark-black text-white flex flex-col transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
  >
    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
      <div className="w-[170px] h-12 overflow-hidden">
        <Image src={whiteLogo} alt="PitchProX" width={170} height={48} className="w-full h-full object-contain object-left" />
      </div>
      <button type="button" onClick={onClose} aria-label="Close steps" className="lg:hidden p-1 text-white/60 hover:text-white cursor-pointer">
        <X className="w-5 h-5" />
      </button>
    </div>
    <nav aria-label="Onboarding steps" className="flex-1 overflow-y-auto px-3 py-4">
      <ol className="space-y-1">
        {steps.map((id, index) => {
          const step = STEPS[id];
          const isCurrent = id === current;
          const isDone = done[id] && !isCurrent;
          const canOpen = index <= reached;
          const Icon = isDone ? CircleCheck : step.icon;
          return (
            <li key={id}>
              <button
                type="button"
                disabled={!canOpen}
                onClick={() => onSelect(id)}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isCurrent ? "bg-white/10 border-l-2 border-primary" : canOpen ? "hover:bg-white/5 cursor-pointer" : "opacity-80 cursor-default"
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isDone ? "text-primary" : "text-white/80"}`} />
                <span>
                  <span className={`block text-sm ${isCurrent || isDone ? "font-semibold" : "font-medium"}`}>{step.label}</span>
                  <span className="block text-[11px] text-white/50">{step.hint}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  </aside>
);

export default function OnboardingFlow({ variant = "sales-rep", live = false }) {
  const config = VARIANTS[variant];
  const { data, actions, loading, error, reload, preview } = useOnboarding(variant, live);
  const [viewing, setViewing] = useState(null); // step the user opened; null = the first unfinished one
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F7F8FA] font-secondary text-sm text-medium-black">
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading your onboarding…
          </>
        ) : (
          <>
            <p>{error}</p>
            <button type="button" onClick={reload} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold cursor-pointer">
              Try again
            </button>
          </>
        )}
      </div>
    );
  }

  const { steps, done } = data;
  // Steps up to the first unfinished one can be opened; later ones stay locked
  const reached = Math.max(0, steps.indexOf(data.current));
  const current = viewing && steps.indexOf(viewing) <= reached ? viewing : data.current;
  const index = steps.indexOf(current);
  const countable = steps.filter((id) => id !== "complete").length;
  const stepNumber = Math.min(index + 1, countable);
  const finished = steps.filter((id) => id !== "complete" && done[id]).length;
  const percent = current === "complete" ? 100 : Math.round((finished / countable) * 100);

  const goTo = (id) => {
    setViewing(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // Next is only offered once the step is done (the server enforces the same order)
  const next = () => {
    const target = steps[index + 1];
    if (target) goTo(target);
  };
  const back = index > 0 ? () => goTo(steps[index - 1]) : undefined;

  const withSidePanel = (content) => (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_290px] gap-4">
      <div className="min-w-0">{content}</div>
      <div className="flex flex-col gap-4">
        <OnboardingDetails details={data.details} dueDate={data.dueDate} />
        <WhatHappensNext />
        <NeedHelp />
      </div>
    </div>
  );

  let body;
  switch (current) {
    case "welcome":
      body = withSidePanel(
        <WelcomeStep
          steps={steps}
          onNext={async () => {
            try {
              if (!done.welcome) await actions.start();
              next();
            } catch (startError) {
              showError("Couldn't start", startError.message);
            }
          }}
        />
      );
      break;
    case "policies":
      body = withSidePanel(
        <PolicyReviewStep
          key="policies"
          title="Review Company Policies"
          subtitle="Please read each policy carefully. You must scroll to the bottom and acknowledge to continue."
          policies={data.companyPolicies}
          acknowledged={data.policyAcks}
          onAcknowledge={actions.acknowledge}
          onBack={back}
          onNext={next}
          why="These policies help us protect our customers, our data, and each other. Compliance is mandatory for all active accounts."
        />
      );
      break;
    case "ethics":
      body = withSidePanel(
        <PolicyReviewStep
          key="ethics"
          title="AI Ethics"
          subtitle="PitchProX guides live conversations with AI. Read how it must be used and acknowledge each policy to continue."
          policies={data.aiPolicies}
          acknowledged={data.ethicsAcks}
          onAcknowledge={actions.acknowledge}
          onBack={back}
          onNext={next}
          why="Prospects must always know when AI or recording is involved. These rules keep every call honest and compliant."
        />
      );
      break;
    case "security":
      body = withSidePanel(
        <SecurityStep security={data.security} onSelectMfa={actions.selectMfa} onSetPassword={actions.setPassword} onBack={back} onNext={next} />
      );
      break;
    case "training":
      body = (
        <TrainingStep
          title={data.training.title}
          modules={data.training.modules}
          documents={data.training.documents}
          completed={data.training.completed}
          onComplete={actions.completeModule}
          onBack={back}
          onNext={next}
        />
      );
      break;
    case "final":
      body = (
        <FinalStep
          details={data.details}
          policyCount={data.companyPolicies.length}
          includesVoice={steps.includes("voice")}
          signerName={data.name}
          defaultEmployeeId={data.employeeId}
          onSubmit={done.final ? undefined : actions.signFinal}
          onBack={back}
          onNext={next}
        />
      );
      break;
    case "voice":
      body = (
        <VoiceStep
          onBack={back}
          onNext={async () => {
            try {
              if (!done.voice) await actions.completeVoice(300);
              next();
            } catch (voiceError) {
              showError("Not saved", voiceError.message);
            }
          }}
        />
      );
      break;
    default:
      body = <CompleteStep details={data.details} nextSteps={config.nextSteps} includesVoice={steps.includes("voice")} dashboard={config.dashboard} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-secondary">
      <StepsSidebar steps={steps} current={current} reached={reached} done={done} onSelect={goTo} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button type="button" aria-label="Close steps" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-dark-black/40 lg:hidden" />}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-light-gray flex items-center justify-between gap-3 px-4 sm:px-6">
          <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open steps" className="lg:hidden p-2 rounded-lg hover:bg-light-gray cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          {preview && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700">
              <Eye className="w-3.5 h-3.5" /> Preview — nothing is saved
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-light-gray bg-light-gray/60 px-3 py-1.5 text-xs text-dark-black">
              <Clock className="w-3.5 h-3.5" /> Estimated time: 18 min
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
              <CalendarDays className="w-3.5 h-3.5" /> Due by {data.dueDate}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 flex flex-col gap-4">
          {current !== "complete" && (
            <div>
              <h1 className="text-2xl font-bold text-dark-black">Welcome to PitchProX 👋</h1>
              <p className="text-sm text-medium-black mt-1">Complete your onboarding to activate your account and start using PitchProX.</p>
              <p className="text-xs text-dark-black mt-4 mb-1.5">
                Step {stepNumber} of {countable} • <span className="text-primary">{percent}% complete</span>
              </p>
              <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}
          {body}
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CircleCheck,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  Lightbulb,
  Lock,
  MessageSquare,
  Mic,
  MonitorPlay,
  PartyPopper,
  Play,
  Rocket,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  User,
  Zap,
  Circle,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { showSavedToast } from "@/lib/toast";
import { showError } from "@/lib/alerts";
import SimulationHeader from "@/app/internal-sales-representative/calibration/components/simulator-header";
import RoundTracker from "@/app/internal-sales-representative/calibration/components/round-tracker";
import AudioPlayerCard from "@/app/internal-sales-representative/calibration/components/audio-player";
import TeleprompterCard from "@/app/internal-sales-representative/calibration/components/teleprompter";
import RecorderCard from "@/app/internal-sales-representative/calibration/components/recorder";
import SimulationSidePanel from "@/app/internal-sales-representative/calibration/components/simulation-side-panel";
import ScoreMetricsCard from "@/app/internal-sales-representative/calibration/components/score-matrix";
import { Card, CheckboxRow, LogDataRecorded, NeedHelp, OnboardingDetails, StepFooter } from "./onboarding-ui";
import { EMPLOYEE_ID, EMPLOYEE_NAME, STEPS, TRAINING_DOCUMENTS, TRAINING_MODULES } from "./onboarding-data";

// ── Welcome ──────────────────────────────────────────────────────────────────

export const WelcomeStep = ({ steps, onNext }) => (
  <div className="flex flex-col gap-4">
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <span className="w-12 h-12 rounded-2xl bg-light-teal text-primary flex items-center justify-center shrink-0">
          <Rocket className="w-6 h-6" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-dark-black">Let&apos;s get you set up</h2>
          <p className="text-sm text-medium-black mt-1">
            Complete these steps to activate your account. You can leave and come back at any time; your progress is saved.
          </p>
        </div>
      </div>
      <ol className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {steps
          .filter((id) => id !== "welcome" && id !== "complete")
          .map((id, index) => {
            const step = STEPS[id];
            return (
              <li key={id} className="flex items-center gap-3 rounded-xl border border-light-gray p-4">
                <span className="w-9 h-9 rounded-lg bg-light-gray text-primary flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-dark-black">{index + 1}. {step.label}</span>
                  <span className="block text-xs text-medium-black">{step.hint}</span>
                </span>
              </li>
            );
          })}
      </ol>
      <p className="flex items-center gap-2 mt-5 text-xs text-medium-black">
        <Clock className="w-4 h-4" /> About 18 minutes in total. Everything must be finished before your onboarding due date.
      </p>
    </Card>
    <StepFooter onNext={onNext} nextLabel="Get Started" />
  </div>
);

// ── Security setup ───────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: "At least 8 characters long", test: (value) => value.length >= 8 },
  { label: "Uppercase & lowercase letters", test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { label: "At least one number", test: (value) => /\d/.test(value) },
  { label: "At least one special symbol (@, #, $)", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const MFA_OPTIONS = [
  { id: "sms", icon: Smartphone, title: "SMS Verification", text: "Receive a one-time passcode via text message to your registered mobile device.", recommended: true },
  { id: "mail", icon: MessageSquare, title: "Mail Verification", text: "Receive a one-time passcode via mail to your registered mail." },
];

const PasswordField = ({ id, label, value, onChange }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-medium-black mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-300 bg-light-gray/50 text-sm text-dark-black outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-black cursor-pointer"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// onSelectMfa(method) and onSetPassword(password, confirm) may be async (live onboarding saves them)
export const SecurityStep = ({ security, onSelectMfa, onSetPassword, onBack, onNext }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const valid = PASSWORD_RULES.every((rule) => rule.test(password));
  const matches = password && password === confirm;

  const [saving, setSaving] = useState(false);

  const savePassword = async () => {
    setSaving(true);
    try {
      await onSetPassword(password, confirm);
      setPassword("");
      setConfirm("");
      showSavedToast("Password set", "Use your new password the next time you sign in.");
    } catch (error) {
      showError("Password not saved", error.message);
    } finally {
      setSaving(false);
    }
  };

  const chooseMfa = async (method) => {
    try {
      await onSelectMfa(method);
    } catch (error) {
      showError("Not saved", error.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <h2 className="text-xl font-semibold text-dark-black">Security Setup</h2>
        <p className="text-xs text-medium-black mt-1 mb-5">Enhance your account security by configuring multi-factor authentication and your recovery options.</p>

        <div className="rounded-xl border border-light-gray p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-lg bg-light-teal text-primary flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></span>
            <div>
              <p className="text-base font-semibold text-dark-black">Multi-Factor Authentication (MFA)</p>
              <p className="text-xs text-medium-black">Requirement: Mandatory for Admin access</p>
            </div>
          </div>
          <div role="radiogroup" aria-label="MFA method" className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MFA_OPTIONS.map((option) => {
              const selected = security.mfa === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => chooseMfa(option.id)}
                  className={`text-left rounded-xl border p-4 transition-colors cursor-pointer ${selected ? "border-primary bg-light-teal/40" : "border-light-gray bg-light-gray/40 hover:border-primary/40"}`}
                >
                  <span className="flex items-start justify-between">
                    <option.icon className={`w-5 h-5 ${selected ? "text-primary" : "text-medium-black"}`} />
                    {option.recommended && <span className="text-[11px] font-semibold text-primary">Recommended</span>}
                  </span>
                  <span className={`block mt-2 text-sm font-semibold ${selected ? "text-primary" : "text-dark-black"}`}>{option.title}</span>
                  <span className="block text-[11px] text-medium-black mt-0.5">{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="rounded-xl border border-light-gray p-4 space-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-dark-black"><RotateCcw className="w-4 h-4" /> Set Password</p>
            <PasswordField id="onboarding-password" label="Set Password" value={password} onChange={setPassword} />
            <PasswordField id="onboarding-password-confirm" label="Confirm Password" value={confirm} onChange={setConfirm} />
            {confirm && !matches && <p className="text-[11px] text-red-600">Passwords don&apos;t match.</p>}
          </div>
          <div className="rounded-xl border border-light-gray p-4 flex flex-col">
            <p className="flex items-center gap-2 text-sm font-semibold text-dark-black mb-3"><Lock className="w-4 h-4" /> Password Security</p>
            <ul className="space-y-2 flex-1">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <li key={rule.label} className="flex items-center gap-2 text-xs text-dark-black">
                    {passed ? <CircleCheck className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-light-black" />}
                    {rule.label}
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={savePassword}
              disabled={!valid || !matches || security.passwordSet || saving}
              className="mt-4 w-full py-2 rounded-lg border border-gray-300 text-sm font-semibold text-dark-black hover:bg-light-gray cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {security.passwordSet ? "Password Set" : "Change Password"}
            </button>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-sm font-semibold text-primary mb-1.5">Why this matters</p>
              <p className="text-[11px] leading-4 text-medium-black">
                As a PitchProX team member, you handle sensitive market intelligence and proprietary sales data. Robust security prevents unauthorized access and maintains client trust.
              </p>
            </div>
            <LogDataRecorded />
          </div>
        </div>
      </Card>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!security.mfa || !security.passwordSet} hint="Choose an MFA method and set your password" />
    </div>
  );
};

// ── Training ─────────────────────────────────────────────────────────────────

const MODULE_STATUS = {
  done: { label: "Completed", className: "bg-emerald-50 text-emerald-600", icon: <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="w-4 h-4" strokeWidth={3} /></span> },
  current: { label: "In Progress", className: "bg-indigo-50 text-indigo-600", icon: <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center"><Play className="w-3.5 h-3.5 fill-current" /></span> },
  todo: { label: "Not Started", className: "bg-light-gray text-medium-black", icon: <span className="w-7 h-7 rounded-full border border-gray-300 text-medium-black flex items-center justify-center"><Play className="w-3 h-3" /></span> },
};

// modules: [{ id, title, minutes }]; onComplete(moduleId) may be async
export const TrainingStep = ({ completed, onComplete, onBack, onNext, modules = TRAINING_MODULES, documents = TRAINING_DOCUMENTS, title = "Onboarding Training", description }) => {
  const [tab, setTab] = useState("overview");
  const doneCount = modules.filter((module) => completed[module.id]).length;
  const percent = Math.round((doneCount / modules.length) * 100);
  const currentId = modules.find((module) => !completed[module.id])?.id;

  const startModule = async (module) => {
    try {
      await onComplete(module.id);
      showSavedToast("Module completed", `${module.title} is done.`);
    } catch (error) {
      showError("Not saved", error.message);
    }
  };

  const download = (name) => showSavedToast("Download started", `${name}.pdf is downloading.`);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_290px] gap-4">
      <div className="flex flex-col gap-4 min-w-0">
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-dark-black mb-4">Training Details</h2>
          <div className="flex flex-col sm:flex-row gap-4 rounded-xl border border-light-gray p-3">
            <button
              type="button"
              onClick={() => currentId && startModule(modules.find((module) => module.id === currentId))}
              aria-label="Play current module"
              className="w-full sm:w-36 h-24 rounded-lg bg-dark-black flex items-center justify-center text-white shrink-0 cursor-pointer"
            >
              <MonitorPlay className="w-8 h-8 opacity-70" />
            </button>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-lg font-semibold text-dark-black">
                {title} <span className="px-1.5 py-0.5 rounded bg-light-teal text-[9px] font-bold uppercase tracking-wide text-primary">Required</span>
              </p>
              <p className="text-xs text-medium-black mt-1">Understand your responsibilities in protecting personal data and maintaining privacy.</p>
              <div className="mt-3 inline-flex items-center gap-3 rounded-lg bg-light-gray/70 px-3 py-2 text-xs">
                <span className="font-medium text-dark-black">Overall Progress</span>
                <span className="w-32 h-1.5 rounded-full bg-gray-200 overflow-hidden"><span className="block h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} /></span>
                <span className="font-semibold text-dark-black">{percent}% Complete</span>
              </div>
            </div>
          </div>

          <div role="tablist" className="flex gap-6 border-b border-light-gray mt-5">
            {["overview", "resources"].map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`pb-2.5 text-sm capitalize cursor-pointer ${tab === id ? "text-primary border-b-2 border-primary font-medium" : "text-medium-black"}`}
              >
                {id}
              </button>
            ))}
          </div>

          {tab === "overview" ? (
            <>
              <div className="rounded-xl border border-light-gray p-4 mt-4">
                <h3 className="text-sm font-semibold text-dark-black">About This Training</h3>
                <p className="text-xs leading-5 text-medium-black mt-2">
                  This training will help you understand how to handle and protect personal and sensitive data in accordance with company policies and global privacy regulations. You&apos;ll learn best practices for data handling, storage and sharing to reduce risk and ensure compliance.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {[
                    { icon: Clock, label: "Estimated time", value: "45-60 minutes" },
                    { icon: BarChart3, label: "Type", value: "Online Training" },
                    { icon: Award, label: "Certificate", value: "Provided on Completion" },
                  ].map((tile) => (
                    <div key={tile.label} className="flex items-center gap-3 rounded-lg bg-light-teal/30 border border-light-teal p-3">
                      <span className="w-8 h-8 rounded-lg bg-light-teal text-primary flex items-center justify-center"><tile.icon className="w-4 h-4" /></span>
                      <span>
                        <span className="block text-[9px] font-semibold uppercase tracking-wide text-light-black">{tile.label}</span>
                        <span className="block text-xs font-semibold text-dark-black">{tile.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-light-gray p-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-dark-black">Course Modules</h3>
                  <span className="flex items-center gap-2 text-[11px] text-dark-black">
                    {doneCount} of {modules.length} completed
                    <span className="w-20 h-1 rounded-full bg-gray-200 overflow-hidden"><span className="block h-full bg-emerald-500" style={{ width: `${percent}%` }} /></span>
                  </span>
                </div>
                <ul className="space-y-2">
                  {modules.map((module, index) => {
                    const state = completed[module.id] ? "done" : module.id === currentId ? "current" : "todo";
                    const meta = MODULE_STATUS[state];
                    return (
                      <li key={module.id}>
                        <button
                          type="button"
                          disabled={state !== "current"}
                          onClick={() => startModule(module)}
                          className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
                            state === "current" ? "border-indigo-200 bg-white cursor-pointer hover:bg-indigo-50/40" : "border-light-gray bg-light-gray/40 cursor-default"
                          }`}
                        >
                          {meta.icon}
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-dark-black">{index + 1}. {module.title}</span>
                            <span className="block text-[11px] text-medium-black">{module.minutes} min</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${meta.className}`}>{meta.label}</span>
                          <ChevronRight className="w-4 h-4 text-light-black" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {currentId && <p className="text-[11px] text-medium-black mt-3">Select the module in progress to continue it.</p>}
              </div>
            </>
          ) : (
            <ul className="mt-4 divide-y divide-light-gray rounded-xl border border-light-gray">
              {documents.map((doc) => (
                <li key={doc.name} className="flex items-center gap-3 px-4 py-3">
                  <FileText className="w-5 h-5 text-red-500" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-dark-black">{doc.name}</span>
                    <span className="block text-[11px] text-light-black">{doc.size}</span>
                  </span>
                  <button type="button" onClick={() => download(doc.name)} className="text-xs font-semibold text-primary hover:underline cursor-pointer">Download</button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <StepFooter onBack={onBack} onNext={onNext} nextDisabled={doneCount < modules.length} hint="Finish all modules to continue" />
      </div>

      <div className="flex flex-col gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-dark-black mb-3">Related Documents</h3>
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.name} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><FileText className="w-4 h-4" /></span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-dark-black truncate">{doc.name}</span>
                  <span className="block text-[10px] text-light-black">{doc.size}</span>
                </span>
                <button type="button" aria-label={`Download ${doc.name}`} onClick={() => download(doc.name)} className="text-light-black hover:text-primary cursor-pointer">
                  <Download className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <NeedHelp />
      </div>
    </div>
  );
};

// ── Final acknowledgment ─────────────────────────────────────────────────────

const CERTIFICATIONS = [
  "I have reviewed the required company policies.",
  "I understand my security responsibilities.",
  "I completed the required training modules.",
  "I agree to comply with company standards while using PitchProX.",
  "I understand that my use of the platform may be logged for security, quality assurance, and compliance purposes.",
];

const AUDIT_ITEMS = ["Date & Time", "Policy Versions", "User Account", "Training Completion Status", "IP Address", "Electronic Signature", "Device Information", "Acknowledgement ID", "Browser"];

const todayLabel = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// onSubmit({ signature, employeeId, statements }) may be async (live onboarding records the signature)
export const FinalStep = ({ details, policyCount, includesVoice, onBack, onNext, onSubmit, defaultEmployeeId = EMPLOYEE_ID, signerName = EMPLOYEE_NAME }) => {
  const [checks, setChecks] = useState(CERTIFICATIONS.map(() => false));
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [today] = useState(todayLabel);
  const ready = checks.every(Boolean) && name.trim().length >= 3;

  const submit = async () => {
    setSubmitting(true);
    try {
      await onSubmit?.({ signature: name, employeeId, statements: checks });
      showSavedToast("Acknowledgment signed", "Your certification was recorded.");
      onNext();
    } catch (error) {
      showError("Not signed", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const next = [
    { title: "Final acknowledgement submitted", text: "Your certification will be securely recorded." },
    { title: "Account activated", text: "Your PitchProX account will be activated." },
    ...(includesVoice ? [{ title: "Voice calibration", text: "Calibrate your voice for the best AI guidance." }] : []),
    { title: "Access to PitchProX", text: "Start making smarter calls with confidence." },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_310px] gap-4">
      <div className="flex flex-col gap-4 min-w-0">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-dark-black">Onboarding Summary</h2>
          <p className="text-xs text-medium-black mt-0.5 mb-4">You&apos;ve completed all required onboarding steps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, title: "Company Policies", text: "Reviewed" },
              { icon: Lock, title: "Security Setup", text: "Completed" },
              { icon: BookOpen, title: "Training Modules", text: "Completed" },
            ].map((tile) => (
              <div key={tile.title} className="flex items-center gap-3 rounded-lg bg-light-gray/70 p-3">
                <tile.icon className="w-4 h-4 text-primary" />
                <span className="flex-1">
                  <span className="block text-xs font-semibold text-dark-black">{tile.title}</span>
                  <span className="block text-[10px] text-light-black">{tile.text}</span>
                </span>
                <CircleCheck className="w-4 h-4 text-emerald-500" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 flex flex-col sm:flex-row gap-6">
          <span className="w-20 h-20 rounded-full bg-light-teal/50 ring-8 ring-light-teal/30 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-9 h-9" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-dark-black">Certification Statement</h2>
            <p className="text-sm text-medium-black mt-2 mb-4">
              I acknowledge that I have completed the required onboarding process and understand my responsibilities when using PitchProX.
            </p>
            <div className="space-y-3">
              {CERTIFICATIONS.map((text, index) => (
                <CheckboxRow key={text} checked={checks[index]} onChange={(value) => setChecks((prev) => prev.map((item, i) => (i === index ? value : item)))}>
                  {text}
                </CheckboxRow>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-dark-black">Electronic Signature</h2>
          <p className="text-xs text-medium-black mt-0.5 mb-4">Please provide your full name to sign electronically.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sign-name" className="block text-[10px] font-semibold uppercase tracking-wide text-dark-black mb-1.5">Full legal name</label>
              <input id="sign-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={signerName} className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-light-gray/50 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <p className="block text-[10px] font-semibold uppercase tracking-wide text-dark-black mb-1.5">Today&apos;s date</p>
              <p className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-300 bg-light-gray/50 text-sm text-dark-black"><CalendarDays className="w-4 h-4 text-medium-black" /> {today}</p>
            </div>
            <div>
              <label htmlFor="sign-id" className="block text-[10px] font-semibold uppercase tracking-wide text-dark-black mb-1.5">Employee ID <span className="text-light-black">(optional)</span></label>
              <input id="sign-id" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-light-gray/50 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <p className="text-[11px] italic text-medium-black mt-3">By typing your name above, you are electronically signing this acknowledgement.</p>
        </Card>

        <StepFooter onBack={onBack} onNext={submit} nextDisabled={!ready || submitting} hint="Tick every statement and sign" />
      </div>

      <div className="flex flex-col gap-4">
        <OnboardingDetails
          details={details}
          showDue={false}
          extra={{ "Policies Completed": `${policyCount} of ${policyCount}`, "Training Progress": "100%", "Security Status": "Complete" }}
        />
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-dark-black mb-4"><Zap className="w-4 h-4 text-primary" /> What Happens Next?</h3>
          <ol className="space-y-4">
            {next.map((item, index) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">{index + 1}</span>
                <span>
                  <span className="block text-xs font-semibold text-dark-black">{item.title}</span>
                  <span className="block text-[11px] text-medium-black">{item.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-dark-black mb-2"><ShieldCheck className="w-4 h-4 text-primary" /> Audit Record</h3>
          <p className="text-[11px] text-medium-black mb-3">This acknowledgement will securely record:</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {AUDIT_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[10px] text-dark-black"><Check className="w-3 h-3 text-primary" /> {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

// ── Voice calibration (sales reps) ───────────────────────────────────────────

// Reuses the sales rep calibration simulator; the real scoring comes with the backend.
export const VoiceStep = ({ onBack, onNext }) => (
  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_310px] gap-4">
    <div className="flex flex-col gap-4 min-w-0">
      <SimulationHeader />
      <RoundTracker />
      <AudioPlayerCard />
      <TeleprompterCard />
      <RecorderCard />
      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
    <div className="flex flex-col gap-4">
      <SimulationSidePanel />
      <ScoreMetricsCard />
    </div>
  </div>
);

// ── Complete ─────────────────────────────────────────────────────────────────

export const CompleteStep = ({ details, nextSteps, includesVoice, dashboard }) => {
  const items = [
    { icon: User, title: "Account Activated", text: "Your PitchProX account is now active and ready to use." },
    { icon: ShieldCheck, title: "Security Configured", text: "Multi-factor authentication and security settings are enabled." },
    { icon: FileText, title: "Company Policies Acknowledged", text: "You've reviewed and acknowledged all required company policies." },
    { icon: BookOpen, title: "Training Completed", text: "You've completed all required training modules." },
    ...(includesVoice ? [{ icon: Mic, title: "Voice Calibrated", text: "Your voice has been calibrated for the best AI performance." }] : []),
  ];

  return (
    <Card className="p-6">
      <div className="text-center mb-8">
        <span className="inline-flex w-14 h-14 rounded-full bg-light-teal text-primary items-center justify-center"><PartyPopper className="w-7 h-7" /></span>
        <h1 className="text-3xl font-bold text-dark-black mt-3">
          You&apos;re <span className="text-primary">Ready.</span>
        </h1>
        <p className="text-sm text-medium-black mt-2 max-w-md mx-auto">Welcome to PitchProX. Your onboarding is complete, and your account is ready for live conversations.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_330px] gap-5">
        <div className="flex flex-col gap-5 min-w-0">
          <div className="rounded-2xl border border-light-gray overflow-hidden">
            <div className="flex items-center gap-3 bg-light-gray/70 px-5 py-4">
              <span className="w-9 h-9 rounded-full border-2 border-primary text-primary flex items-center justify-center"><Check className="w-4 h-4" /></span>
              <span>
                <span className="block text-sm font-semibold text-dark-black">Your Workspace Is Ready</span>
                <span className="block text-xs text-medium-black">All required setup steps have been successfully completed.</span>
              </span>
            </div>
            <ul className="divide-y divide-light-gray">
              {items.map((item) => (
                <li key={item.title} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-9 h-9 rounded-lg bg-light-gray text-medium-black flex items-center justify-center"><item.icon className="w-4 h-4" /></span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-dark-black">{item.title}</span>
                    <span className="block text-xs text-medium-black">{item.text}</span>
                  </span>
                  <CircleCheck className="w-5 h-5 text-white fill-primary" />
                </li>
              ))}
            </ul>
          </div>

          {includesVoice && (
            <div className="rounded-2xl bg-dark-black text-white p-6 flex flex-col md:flex-row gap-6">
              <span className="w-14 h-14 rounded-xl bg-primary/20 text-secondary flex items-center justify-center shrink-0"><Lightbulb className="w-7 h-7" /></span>
              <div className="md:w-56 shrink-0">
                <p className="text-lg font-semibold">Your AI Is Ready</p>
                <p className="text-xs text-white/70 mt-1">Your personalized AI has been prepared and is ready to provide real-time guidance and conversation intelligence.</p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[11px] text-white/80 flex-1">
                {["Live teleprompting", "Conversation intelligence", "Adaptive responses", "Trust & emotion detection", "Real-time objection guidance", "Performance insights"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-secondary" /> {feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center">
            <Link href={dashboard} className="inline-flex items-center gap-2 px-10 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-medium-teal">
              Launch PitchProX <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-medium-black mt-2"><Lock className="w-3 h-3" /> Your data is secure and encrypted</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-dark-black mb-1.5">Step 7 of 7 • <span className="text-primary">100% complete</span></p>
            <div className="h-1.5 rounded-full bg-primary" />
          </div>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-dark-black mb-4"><TrendingUp className="w-4 h-4 text-primary" /> Account Status</h3>
            <div className="flex items-center gap-5">
              <span className="w-24 h-24 rounded-full border-[6px] border-primary flex flex-col items-center justify-center shrink-0">
                <span className="text-xl font-bold text-dark-black">100%</span>
                <span className="text-[9px] font-semibold text-primary">READY</span>
              </span>
              <dl className="flex-1 space-y-1.5 text-[11px]">
                {Object.entries(details).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2"><dt className="text-medium-black">{label}</dt><dd className="font-semibold text-dark-black text-right">{value}</dd></div>
                ))}
                <div className="flex justify-between gap-2"><dt className="text-medium-black">Workspace Status</dt><dd className="font-semibold text-primary">Active</dd></div>
              </dl>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-dark-black">🚀 What&apos;s Next?</h3>
            <p className="text-[11px] text-medium-black mb-4">Here&apos;s what we recommend you do first.</p>
            <ol className="space-y-4">
              {nextSteps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">{index + 1}</span>
                  <span>
                    <span className="block text-sm font-semibold text-dark-black">{step.title}</span>
                    <span className="block text-[11px] text-medium-black">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
          <NeedHelp />
        </div>
      </div>
    </Card>
  );
};


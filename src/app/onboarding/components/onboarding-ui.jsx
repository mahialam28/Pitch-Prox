"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  FileSignature,
  HelpCircle,
  Info,
  ListChecks,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import { DUE_DATE, SUPPORT_EMAIL } from "./onboarding-data";

export const Card = ({ className = "", children }) => (
  <section className={`bg-white rounded-2xl border border-light-gray shadow-xs ${className}`}>{children}</section>
);

const DETAIL_ICONS = { Role: UserCog, Department: Building2, Manager: User, "Start Date": CalendarDays };

export const OnboardingDetails = ({ details, extra = {}, showDue = true, dueDate = DUE_DATE }) => (
  <Card className="p-5">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-dark-black mb-4">
      <User className="w-4 h-4 text-primary" /> Your Onboarding Details
    </h3>
    <dl className="space-y-3 text-xs">
      {Object.entries(details).map(([label, value]) => {
        const Icon = DETAIL_ICONS[label] ?? ListChecks;
        return (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-medium-black"><Icon className="w-3.5 h-3.5" /> {label}</dt>
            <dd className="font-semibold text-dark-black text-right">{value}</dd>
          </div>
        );
      })}
      {showDue && (
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-medium-black"><CircleAlert className="w-3.5 h-3.5" /> Onboarding Due</dt>
          <dd className="font-semibold text-red-600">{dueDate}</dd>
        </div>
      )}
      {Object.entries(extra).map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-medium-black"><ListChecks className="w-3.5 h-3.5" /> {label}</dt>
          <dd className="font-semibold text-dark-black text-right">{value}</dd>
        </div>
      ))}
    </dl>
  </Card>
);

const NEXT = [
  { icon: ListChecks, title: "Complete all required steps", text: "Follow the checklist on the left" },
  { icon: ShieldCheck, title: "Acknowledge all policies", text: "Required before account activation" },
  { icon: BookOpen, title: "Finish all training modules", text: "Some include short quizzes" },
  { icon: FileSignature, title: "Final acknowledgment", text: "Sign and agree to confirm" },
  { icon: CircleCheck, title: "Account activation", text: "Access to all tools and features" },
];

export const WhatHappensNext = () => (
  <Card className="p-5">
    <h3 className="text-sm font-semibold text-dark-black mb-4">What happens next?</h3>
    <ul className="space-y-4">
      {NEXT.map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-lg bg-light-gray text-medium-black flex items-center justify-center shrink-0">
            <item.icon className="w-4 h-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-dark-black">{item.title}</span>
            <span className="block text-[11px] text-medium-black">{item.text}</span>
          </span>
        </li>
      ))}
    </ul>
  </Card>
);

export const NeedHelp = () => (
  <section className="relative overflow-hidden rounded-2xl bg-light-gray border border-light-gray p-5">
    <h3 className="text-lg font-semibold text-dark-black">Need Help?</h3>
    <p className="text-xs text-medium-black mt-2 max-w-[220px]">Our success team is available 24/7 to help you optimize your PitchProX setup.</p>
    <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:underline">
      Contact Support <ArrowRight className="w-3.5 h-3.5" />
    </a>
    <HelpCircle aria-hidden className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-300/70" />
  </section>
);

export const WhyThisMatters = ({ children }) => (
  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
    <p className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1.5"><Info className="w-4 h-4" /> Why this matters</p>
    <p className="text-[11px] leading-4 text-medium-black">{children}</p>
  </div>
);

export const LogDataRecorded = () => (
  <div className="rounded-xl border border-light-gray bg-light-gray/60 p-4">
    <p className="flex items-center gap-1.5 text-sm font-semibold text-dark-black mb-2"><ClipboardList className="w-4 h-4" /> Log data recorded</p>
    <ul className="space-y-1 text-[11px] text-medium-black">
      {["Date & time", "IP address", "Device information", "Policy version"].map((item) => (
        <li key={item} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> {item}</li>
      ))}
    </ul>
  </div>
);

export const StepFooter = ({ onBack, onNext, nextLabel = "Next Step", nextDisabled, nextIcon = ArrowRight, hint }) => {
  const NextIcon = nextIcon;
  return (
    <Card className="px-4 py-3.5 flex items-center justify-between gap-3">
      {onBack ? (
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm text-dark-black hover:bg-light-gray cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        {hint && nextDisabled && <span className="hidden sm:block text-xs text-medium-black">{hint}</span>}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nextIcon === ArrowRight ? (
            <>
              {nextLabel} <NextIcon className="w-4 h-4" />
            </>
          ) : (
            <>
              <NextIcon className="w-4 h-4" /> {nextLabel}
            </>
          )}
        </button>
      </div>
    </Card>
  );
};

export const CheckboxRow = ({ checked, onChange, disabled, children, className = "" }) => (
  <label className={`flex items-start gap-3 select-none ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" />
    <span className="mt-0.5 w-[18px] h-[18px] rounded border border-gray-300 bg-white flex items-center justify-center shrink-0 peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
    <span className="text-sm text-dark-black">{children}</span>
  </label>
);

"use client";

import React from "react";
import {
  FileText,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  Users,
  CircleDot,
  Check,
} from "lucide-react";

const keyMomentsData = [
  {
    time: "00:45",
    title: "Used AI prompt to open with value framing.",
    description: "Effective start that sets the context.",
    tag: "High Impact",
    tagStyle: "bg-[#dcfce7] text-[#15803d]",
    icon: MessageSquare,
    iconStyle: "bg-[#eff6ff] text-[#3b82f6]",
  },
  {
    time: "03:18",
    title: "Navigated pricing objection with empathy.",
    description: "Acknowledged concern and repositioned value.",
    tag: "Effective",
    tagStyle: "bg-[#ffedd5] text-[#c2410c]",
    icon: AlertTriangle,
    iconStyle: "bg-[#fff7ed] text-[#ea580c]",
  },
  {
    time: "04:12",
    title: "Built rapport by mirroring tone and pace.",
    description: "Shifted to a calmer pace to build trust.",
    tag: "High Impact",
    tagStyle: "bg-[#dcfce7] text-[#15803d]",
    icon: Users,
    iconStyle: "bg-[#f0fdf4] text-[#16a34a]",
  },
  {
    time: "06:42",
    title: "Issued CTA to schedule appointment.",
    description: "Clear close attempt with limited urgency.",
    tag: "Moderate",
    tagStyle: "bg-[#fef9c3] text-[#854d0e]",
    icon: CircleDot,
    iconStyle: "bg-[#faf5ff] text-[#a855f7]",
  },
];

export const CallSummary = () => {
  return (
    <div className="w-full font-sans text-[#1e293b]">
      {/* Title Header */}
      <h2 className="text-[18px] font-bold flex items-center gap-2 text-[#0f172a] mb-5 tracking-tight">
        <FileText className="w-5 h-5 text-[#00a884]" />
        <span>1. Call Summary</span>
      </h2>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Call Overview & Disclosure */}
        <div className="lg:col-span-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100/80 pb-6 lg:pb-0 lg:pr-8">
          <div>
            <h3 className="text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
              CALL OVERVIEW
            </h3>
            <div className="text-[13px] text-[#64748b] leading-relaxed space-y-4 mt-3">
              <p>
                You opened the call with a clear value statement and set
                expectations early. You maintained a professional and confident
                tone throughout the conversation. You adapted your pacing after
                initial hesitation, which helped build trust and keep the
                conversation on track. You handled objections with relevant
                responses and stayed composed. You made a strong attempt to
                secure the next step and ended the call with clarity.
              </p>
              <p>
                Overall, you demonstrated solid control of the call, good use of
                guidance, and a commitment to leading the conversation toward a
                specific outcome.
              </p>
            </div>
          </div>

          {/* Disclosure Card */}
          <div className="mt-6 p-4 bg-[#f0fdf4]/60 border border-[#bbf7d0] rounded-xl flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#00a884]">
                    Summary Disclosure & Compliance Log
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  This coaching report was generated solely from the agent&apos;s side
                  of the conversation. PitchProX restricts analysis exclusively to the agent&apos;s speech and observable agent-side behavior.
                </p>
              </div>
            </div>

            {/* Documented Compliance Moments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#bbf7d0]/60 text-xs">
              <div className="p-2 rounded-lg bg-white border border-[#bbf7d0]/60 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Disclosure Detected:</span>
                <span className="font-bold text-slate-800">Yes</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#bbf7d0]/60 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Disclosure Timestamp:</span>
                <span className="font-bold font-mono text-slate-800">00:12</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#bbf7d0]/60 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Consent Issue Detected:</span>
                <span className="font-bold font-mono text-amber-600">00:18</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#bbf7d0]/60 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Stop AI Prompt Displayed:</span>
                <span className="font-bold font-mono text-slate-800">00:18</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#bbf7d0]/60 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Continued After Prompt:</span>
                <span className="font-bold text-slate-800">Yes</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#bbf7d0]/60 flex items-center justify-between">
                <span className="text-slate-500 font-medium">AI Stopped:</span>
                <span className="font-bold text-slate-800">No</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#00a884] font-semibold">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Saved to Call Record: ✓ All compliance data logged to CRM</span>
            </div>
          </div>
        </div>

        {/* Right Column: Key Moments Log Timeline */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          <h3 className="text-[11px] font-bold tracking-wider text-[#00a884] uppercase mb-4">
            KEY MOMENTS LOG
          </h3>

          <div className="relative space-y-6 before:absolute before:inset-0 before:left-[19px] before:w-[1px] before:bg-gray-100">
            {keyMomentsData.map((moment, index) => {
              const IconComponent = moment.icon;
              return (
                <div
                  key={index}
                  className="relative flex items-start justify-between gap-4"
                >
                  {/* Timeline Icon */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${moment.iconStyle}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div>
                      <span className="text-xs font-bold font-mono text-[#0f172a]">
                        {moment.time}
                      </span>
                      <h4 className="text-[13px] font-bold text-[#0f172a] mt-1">
                        {moment.title}
                      </h4>
                      <p className="text-xs text-[#94a3b8] mt-1">
                        {moment.description}
                      </p>
                    </div>
                  </div>

                  {/* Tag */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded shrink-0 ${moment.tagStyle}`}
                  >
                    {moment.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CallSummary;
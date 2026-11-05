"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  FilePlus,
  Calendar,
  Cpu,
  Sparkles,
  CheckCircle,
  Activity,
  BarChart2,
  Phone,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Smile,
  ListTodo,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import UpdateStatusModal from "./update-status-modal";
import AddNoteModal from "./add-note-modal";
import ScheduleFollowUpModal from "./schedule-followup-modal";
import BadgeSelect from "@/components/shared/dropdown/badge-select";
import { internalOutcomeOptions as outcomeOptions } from "@/utils.js/lead-options";

const keyInsightsData = [
  {
    title: "Client Interest",
    description: "The client is interested in automating lead qualification and improving conversion rates.",
  },
  {
    title: "Primary Pain Point",
    description: "Low response rates and high time investment in manual dialing.",
  },
  {
    title: "Next Step",
    description: "Live demo scheduled for next week",
  },
  {
    title: "Requested",
    description: "Pricing proposal and case studies.",
  },
];

const objectionsData = [
  {
    title: "Pricing Structure",
    description: "Client questioned pricing versus ROI on current manual dialing. Addressed with 3x efficiency case studies.",
  },
  {
    title: "CRM Integration",
    description: "Inquired about bidirectional sync speed. Confirmed sub-second real-time webhook sync.",
  },
  {
    title: "Team Onboarding",
    description: "Concerns regarding rep adoption time. Reassured with 15-minute quick-start training modules.",
  },
];

const sentimentData = [
  {
    title: "Overall Tone",
    description: "Receptive, collaborative, and highly engaged throughout the platform demonstration.",
  },
  {
    title: "Peak Engagement",
    description: "Strongest positive reaction observed during real-time speech guidance walkthrough.",
  },
  {
    title: "Confidence Index",
    description: "High level of customer conversion probability established (+94% Convert The Customer score recorded).",
  },
];

const nextStepsData = [
  {
    title: "Send Follow-Up Package",
    description: "Deliver customized pricing proposal and enterprise case studies within 24 hours.",
  },
  {
    title: "Confirm Live Demo",
    description: "Verify calendar invitation and demo participants for next week's walkthrough.",
  },
  {
    title: "Update CRM Record",
    description: "Sync call recording summary and tag lead as Hot Priority in CRM.",
  },
];

const statusOptions = [
  { value: "Hot Lead", dotClass: "bg-red" },
  { value: "Warm Lead", dotClass: "bg-amber-400" },
  { value: "Cold Lead", dotClass: "bg-light-blue" },
  { value: "Not Interested", dotClass: "bg-medium-black" },
];

// Transcription only: call audio is not stored
const transcriptData = [
  { speaker: "Rep", time: "00:05", text: "Hi, this is Ryan from PitchProX. Before we start, this call uses AI assistance to help me take notes." },
  { speaker: "Lead", time: "00:16", text: "Sure, go ahead." },
  { speaker: "Rep", time: "00:30", text: "Your team runs a lot of outbound calls. How are you coaching new agents today?" },
  { speaker: "Lead", time: "01:05", text: "Mostly shadowing. It's slow and inconsistent." },
  { speaker: "Rep", time: "02:20", text: "PitchProX gives each agent real-time prompts during calls. Would a 20-minute demo on Tuesday help?" },
  { speaker: "Lead", time: "02:48", text: "Yes, Tuesday afternoon. Send pricing for 6 seats." },
];

const tabs = ["Key Insights", "Transcription", "Objections", "Sentiment", "Next Steps", "Disclosure Log"];

const EndCall = ({ setup = {}, onStartNewCall, outcome, onOutcomeChange }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Key Insights");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [status, setStatus] = useState("Warm Lead");

  const handleDownloadReport = () => {
    toast.success("Call report downloaded successfully!");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Key Insights":
        return keyInsightsData.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00a884]/15 text-[#00a884] flex items-center justify-center shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-dark-black">{item.title}</h4>
              <p className="text-xs text-medium-black mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ));
      case "Transcription":
        return (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {transcriptData.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-light-gray/60">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${item.speaker === "Rep" ? "bg-primary text-white" : "bg-slate-200 text-slate-700"}`}>
                  {item.speaker === "Rep" ? "You" : "Lead"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-dark-black">{item.speaker === "Rep" ? "You" : setup.leadName || "Lead Contact"}</span>
                    <span className="text-[11px] font-mono text-light-black">{item.time}</span>
                  </div>
                  <p className="text-xs text-medium-black mt-1 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case "Objections":
        return objectionsData.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-dark-black">{item.title}</h4>
              <p className="text-xs text-medium-black mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ));
      case "Sentiment":
        return sentimentData.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-dark-black">{item.title}</h4>
              <p className="text-xs text-medium-black mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ));
      case "Next Steps":
        return nextStepsData.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-dark-black">{item.title}</h4>
              <p className="text-xs text-medium-black mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ));
      case "Disclosure Log":
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#f0fdf4]/70 border border-[#bbf7d0] rounded-xl flex items-center justify-between">
              <span className="font-semibold text-dark-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00a884]" />
                Required Pre-Call Compliance Disclosure
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px]">
                Detected (00:12)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl border border-light-gray bg-light-gray/20 flex items-center justify-between">
                <span className="text-light-black font-medium">Disclosure Detected:</span>
                <span className="font-bold text-dark-black">Yes</span>
              </div>
              <div className="p-2.5 rounded-xl border border-light-gray bg-light-gray/20 flex items-center justify-between">
                <span className="text-light-black font-medium">Disclosure Timestamp:</span>
                <span className="font-bold font-mono text-dark-black">00:12</span>
              </div>
              <div className="p-2.5 rounded-xl border border-light-gray bg-light-gray/20 flex items-center justify-between">
                <span className="text-light-black font-medium">Consent Issue Detected:</span>
                <span className="font-bold font-mono text-amber-600">00:18</span>
              </div>
              <div className="p-2.5 rounded-xl border border-light-gray bg-light-gray/20 flex items-center justify-between">
                <span className="text-light-black font-medium">Stop AI Prompt Displayed:</span>
                <span className="font-bold font-mono text-dark-black">00:18</span>
              </div>
              <div className="p-2.5 rounded-xl border border-light-gray bg-light-gray/20 flex items-center justify-between">
                <span className="text-light-black font-medium">Continued After Prompt:</span>
                <span className="font-bold text-dark-black">Yes</span>
              </div>
              <div className="p-2.5 rounded-xl border border-light-gray bg-light-gray/20 flex items-center justify-between">
                <span className="text-light-black font-medium">AI Stopped:</span>
                <span className="font-bold text-dark-black">No</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-[#00a884]/10 border border-[#00a884]/20 rounded-xl text-xs text-[#00a884] font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              <span>Saved to Call Record: ✓ All compliance moments logged and verified</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full font-sans text-dark-black space-y-6">
      {/* Top Banner: AI Call Summary matching user screenshot */}
      <div className="w-full bg-[#030d1a] rounded-2xl p-6 sm:p-8 text-white border border-slate-800/60 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Center Content Column */}
          <div className="lg:col-span-8 flex flex-col items-center text-center space-y-4">
            {/* Call Ended Red Pill */}
            <div className="inline-flex items-center justify-center bg-[#ff4747] text-white text-xs font-semibold px-8 py-2 rounded-full shadow-sm">
              Call Ended
            </div>

            {/* Phone Number */}
            <span className="text-sm sm:text-base font-semibold text-slate-200 tracking-wide">
              {setup.phoneNumber || "(310) 123-4567"}
            </span>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-bold text-[#00a884] tracking-tight">
              Ai Call Summary
            </h2>

            {/* Description Text */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl text-center">
              Today&apos;s call focused on introducing our AI-powered cold calling solution and
              understanding the client&apos;s current outreach process. We discussed their primary pain
              points, including low response rates and high time investment in manual dialing. The
              client expressed interest in automating their lead qualification process and improving
              conversion rates through personalized conversations. A live demo was scheduled for
              next week to showcase the platform&apos;s real-time voice capabilities, CRM integration,
              and analytics dashboard. The call concluded with the client requesting a pricing
              proposal and additional case studies for review before the demo.
            </p>

            {/* Action Buttons Centered */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsStatusOpen(true)}
                className="px-6 py-2.5 rounded-full border border-[#00a884]/40 bg-[#051824] hover:bg-[#082a32] text-xs sm:text-sm font-medium text-slate-200 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                {status ? (
                  <>
                    <span className={`w-2 h-2 rounded-full ${statusOptions.find((o) => o.value === status)?.dotClass || "bg-slate-400"}`} />
                    <span>{status}</span>
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#00a884] hover:bg-medium-teal text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer shadow-xs"
              >
                Set A Follow Up
              </button>
            </div>
          </div>

          {/* Right Side: Call Analysis Card (Conversation Score 84/100, Trust/Engagement/Opportunity, Analysis Ready) */}
          <div className="lg:col-span-4 bg-[#051824] border border-[#00a884]/40 rounded-2xl p-6 flex flex-col justify-between space-y-4 min-h-[280px]">
            <div className="flex items-center justify-between text-white pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00a884]" />
                <h3 className="font-bold text-lg text-white">Call Analysis</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00a884] bg-[#00a884]/15 border border-[#00a884]/30 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Analysis Ready
              </span>
            </div>

            {/* Conversation Score */}
            <div className="flex items-center justify-between bg-[#030d1a] border border-slate-800/80 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Conversation Score
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-extrabold text-[#00a884] font-secondary">
                    84
                  </span>
                  <span className="text-xs font-bold text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#00a884]/10 border-2 border-[#00a884] flex items-center justify-center font-bold text-xs text-[#00a884]">
                84%
              </div>
            </div>

            {/* 3 Quick Indicators Without Clutter */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center">
                <span className="text-[10px] font-semibold text-slate-400">Trust</span>
                <span className="text-xs font-bold text-emerald-400 mt-0.5">Strong</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center">
                <span className="text-[10px] font-semibold text-slate-400">Engagement</span>
                <span className="text-xs font-bold text-sky-400 mt-0.5">High</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center">
                <span className="text-[10px] font-semibold text-slate-400">Opportunity</span>
                <span className="text-xs font-bold text-purple-400 mt-0.5">Positive</span>
              </div>
            </div>

            {/* View Full Analysis Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => router.push("/internal-sales-representative/calls/report")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-medium-teal text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disposition & Metric Bar */}
      <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
        <div className="flex flex-col justify-center">
          <h3 className="text-[16px] font-bold text-dark-black">Disposition</h3>
          <p className="text-[11px] text-light-black font-medium mt-0.5">
            Set the outcome of this call
          </p>
        </div>

        <div className="flex items-center justify-start sm:justify-center">
          <BadgeSelect
            value={outcome}
            onChange={onOutcomeChange}
            options={outcomeOptions}
            placeholder="Select outcome"
            unselectedClassName="bg-transparent text-medium-black border-light-gray hover:bg-light-gray"
          />
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Duration</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">12:20 min</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Talk</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">69%</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Listen Ratio</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">31%</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Convert The Customer</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">94%</p>
        </div>
      </div>

      {/* Tabs Card (Left) & AI Performance (Right) matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: Tabs */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col min-h-[280px]">
          <div className="flex border-b border-light-gray gap-8 pb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[14px] font-semibold pb-2 transition-colors relative cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === tab
                    ? "text-[#00a884] font-bold"
                    : "text-light-black hover:text-dark-black"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#00a884] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="py-4 space-y-4">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Card: AI Performance */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-light-gray shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-1 border-b border-light-gray/60">
            <Sparkles className="w-4 h-4 text-dark-black" />
            <h3 className="text-[14px] font-bold text-dark-black">AI Performance</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Sparkles className="w-3.5 h-3.5 text-medium-black" />
                <span className="font-medium">Prompt Adherence</span>
              </div>
              <span className="font-bold text-purple-600">82%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Sparkles className="w-3.5 h-3.5 text-medium-black" />
                <span className="font-medium">Objections handled</span>
              </div>
              <span className="font-bold text-emerald-600">3 / 3</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Sparkles className="w-3.5 h-3.5 text-medium-black" />
                <span className="font-medium">AI Guidance Used</span>
              </div>
              <span className="font-bold text-[#00a884]">High</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Sparkles className="w-3.5 h-3.5 text-medium-black" />
                <span className="font-medium">Pacing</span>
              </div>
              <span className="font-bold text-[#00a884]">Optimal</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Sparkles className="w-3.5 h-3.5 text-medium-black" />
                <span className="font-medium">Talk To Listen Ratio</span>
              </div>
              <span className="font-bold text-[#3b82f6]">62% / 38%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        <button
          onClick={() => router.push("/internal-sales-representative/calls/report")}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <FileText className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>View Full Report</span>
        </button>

        <button
          onClick={handleDownloadReport}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>Download Report</span>
        </button>

        <button
          onClick={() => setIsNoteOpen(true)}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <FilePlus className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>Add Note</span>
        </button>

        <button
          onClick={() => setIsScheduleOpen(true)}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <Calendar className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>Schedule Follow Up</span>
        </button>

        <button
          onClick={() => router.push("/internal-sales-representative/calls")}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <BarChart2 className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>Back To Calls</span>
        </button>

        <button
          onClick={onStartNewCall}
          className="bg-primary hover:bg-medium-teal text-white p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Phone className="w-4 h-4" />
          <span>Start New Call</span>
        </button>
      </div>

      {/* Modals */}
      <UpdateStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        value={status}
        onSelect={setStatus}
        options={statusOptions}
      />

      <AddNoteModal
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        leadName={setup.leadName}
      />

      <ScheduleFollowUpModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        leadName={setup.leadName}
        phoneNumber={setup.phoneNumber}
      />
    </div>
  );
};

export default EndCall;


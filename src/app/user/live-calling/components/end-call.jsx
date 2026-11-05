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
  ListTodo,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import PurchaseMoreModal from "./purchase-more-modal";
import UpdateStatusModal from "./update-status-modal";
import AddNoteModal from "./add-note-modal";
import ScheduleFollowUpModal from "./schedule-followup-modal";
import BadgeSelect from "@/components/shared/dropdown/badge-select";
import { outcomeOptions } from "@/utils.js/lead-options";

const keyInsightsData = [
  {
    title: "Client Interest",
    description:
      "The client is interested in automating lead qualification and improving conversion rates.",
  },
  {
    title: "Primary Pain Point",
    description:
      "Low response rates and high time investment in manual dialing.",
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

// Homeowner conversation (no audio is stored, only the transcription)
const transcriptData = [
  { speaker: "Rep", time: "00:05", text: "Hi, is this John? This is Sarah with Sunrise Realty. Quick note: this call uses an AI assistant to help me take notes." },
  { speaker: "Lead", time: "00:14", text: "Okay, that's fine. What's this about?" },
  { speaker: "Rep", time: "00:22", text: "I noticed your listing on Ridgeview Drive expired last week. Are you still thinking about selling?" },
  { speaker: "Lead", time: "00:40", text: "Maybe. We were disappointed it didn't sell. The price might have been too high." },
  { speaker: "Rep", time: "01:35", text: "That's common. I can put together a pricing review with three recent sales nearby. Would Thursday at 4 work to go over it?" },
  { speaker: "Lead", time: "02:10", text: "Thursday works. Send me the comparables before then." },
];

const objectionsData = [
  { title: "Listing didn't sell before", description: "Homeowner is frustrated after the expired listing. Addressed with a fresh pricing review and marketing plan." },
  { title: "Commission concerns", description: "Asked about fees. Responded with value: pricing strategy, staging and exposure." },
];

const sentimentData = [
  { title: "Overall tone", description: "Started guarded, became open after the pricing review was offered (+24 trust gain)." },
  { title: "Peak engagement", description: "01:35 to 02:10, when the appointment time was discussed." },
  { title: "Confidence", description: "Homeowner agreed to a Thursday appointment and asked for comparables." },
];


const actionItemsData = [
  {
    title: "Send Follow-Up Package",
    description:
      "Deliver customized pricing proposal and enterprise case studies within 24 hours.",
  },
  {
    title: "Confirm Live Demo",
    description:
      "Verify calendar invitation and demo participants for next week's walkthrough.",
  },
  {
    title: "Update CRM Record",
    description:
      "Sync call recording summary and tag lead as Hot Priority in CRM.",
  },
];

const statusOptions = [
  { value: "Hot Lead", dotClass: "bg-red" },
  { value: "Warm Lead", dotClass: "bg-amber-400" },
  { value: "Cold Lead", dotClass: "bg-light-blue" },
  { value: "Not Interested", dotClass: "bg-medium-black" },
];

const tabs = ["Key Insights", "Transcription", "Objections", "Sentiment", "Disclosure", "Action Items"];

const EndCall = ({ setup = {}, onStartNewCall, outcome, onOutcomeChange }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Key Insights");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [status, setStatus] = useState("Warm Lead");

  const handleDownloadReport = () => {
    toast.success("Call report downloaded successfully!");
  };

  return (
    <div className="w-full font-sans text-dark-black space-y-6">
      {/* Top Banner: User Role AI Call Summary */}
      <div className="w-full bg-[#030d1a] rounded-2xl p-6 sm:p-8 text-white border border-slate-800/60 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Center Content Column */}
          <div className="lg:col-span-8 flex flex-col items-center text-center space-y-4">
            {/* Call Ended Red Pill */}
            <div className="inline-flex items-center justify-center bg-[#ff4747] text-white text-xs font-semibold px-8 py-2 rounded-full shadow-sm">
              Call Ended
            </div>

            {/* Phone Number / Lead Name */}
            <div className="flex flex-col items-center gap-0.5">
              {setup.leadName && (
                <span className="text-base font-bold text-white">
                  {setup.leadName}
                </span>
              )}
              <span className="text-sm sm:text-base font-semibold text-slate-200 tracking-wide">
                {setup.phoneNumber || "(310) 123-4567"}
              </span>
            </div>

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
                type="button"
                onClick={() => setIsStatusOpen(true)}
                className="px-6 py-2.5 rounded-full border border-[#00a884]/40 bg-[#051824] hover:bg-[#082a32] text-xs sm:text-sm font-medium text-slate-200 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                {status ? (
                  <>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        statusOptions.find((o) => o.value === status)?.dotClass ||
                        "bg-slate-400"
                      }`}
                    />
                    <span>{status}</span>
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#00a884] hover:bg-medium-teal text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer shadow-xs"
              >
                Set A Follow Up
              </button>
            </div>
          </div>

          {/* Right Side: Report Card */}
          <div className="lg:col-span-4 bg-[#051824] border border-[#00a884]/40 rounded-2xl p-6 flex flex-col justify-between space-y-4 min-h-[260px]">
            <div className="flex items-center gap-2.5 text-white pb-2 border-b border-slate-800/80">
              <FileText className="w-5 h-5 text-[#00a884]" />
              <h3 className="font-semibold text-xl text-white">Report</h3>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-slate-300 font-medium">Reports Included</span>
              <p className="text-lg text-slate-200 font-bold">5 / 10 used</p>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                <div className="w-1/2 h-full bg-[#00a884] rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <h4 className="text-sm font-semibold text-slate-100">Need more reports?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Purchase additional reports to continue unlocking detailed call insights.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPurchaseOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-medium-teal text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              Buy More Reports
            </button>
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
            placeholder="Select Outcome"
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
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Trust Score</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">94</p>
        </div>
      </div>

      {/* Tabs & AI Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Tabs Content */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col min-h-[280px]">
          <div className="flex border-b border-light-gray gap-6 pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`text-[13px] font-semibold pb-1 transition-colors relative cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === tab
                    ? "text-primary font-bold"
                    : "text-light-black hover:text-dark-black"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="py-4 space-y-3">
            {activeTab === "Key Insights" &&
              keyInsightsData.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-dark-black">{item.title}</h4>
                    <p className="text-xs text-medium-black mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}

            {activeTab === "Transcription" && (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {transcriptData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-light-gray/60"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        item.speaker === "Rep"
                          ? "bg-primary text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.speaker === "Rep" ? "You" : "HO"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-dark-black">
                          {item.speaker === "Rep" ? "You (Agent)" : (setup.leadName || "Lead Contact")}
                        </span>
                        <span className="text-[11px] font-mono text-light-black">{item.time}</span>
                      </div>
                      <p className="text-xs text-medium-black mt-1 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Objections" && (
              <div className="space-y-3">
                {objectionsData.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-dark-black">{item.title}</h4>
                      <p className="text-xs text-medium-black mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Sentiment" && (
              <div className="space-y-3">
                {sentimentData.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Smile className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-dark-black">{item.title}</h4>
                      <p className="text-xs text-medium-black mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Disclosure" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#f0fdf4]/70 border border-[#bbf7d0] rounded-xl flex items-center justify-between gap-2">
                  <span className="font-semibold text-dark-black flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00a884]" />
                    Call Disclosure (AI assistance notice)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px]">Read at 00:08</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    ["Disclosure read", "Yes"],
                    ["Timestamp", "00:08"],
                    ["Consent objection", "None"],
                    ["Recording saved", "No (transcription only)"],
                  ].map(([label, value]) => (
                    <div key={label} className="p-2.5 rounded-xl border border-light-gray bg-light-gray/20 flex items-center justify-between">
                      <span className="text-light-black font-medium">{label}:</span>
                      <span className="font-bold text-dark-black">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-[#00a884]/10 border border-[#00a884]/20 rounded-xl text-[#00a884] font-semibold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Saved to the call record</span>
                </div>
              </div>
            )}

            {activeTab === "Action Items" && (
              <div className="space-y-3">
                {actionItemsData.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-dark-black">{item.title}</h4>
                      <p className="text-xs text-medium-black mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right AI Performance */}
        <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-[13px] font-bold text-dark-black">AI Performance</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Prompt Adherence</span>
              </div>
              <span className="font-bold text-purple-600">82%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Objections handled</span>
              </div>
              <span className="font-bold text-emerald-600">3 / 3</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Cpu className="w-3.5 h-3.5 text-teal-500" />
                <span>AI Guidance Used</span>
              </div>
              <span className="font-bold text-teal-600">High</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pacing</span>
              </div>
              <span className="font-bold text-emerald-600">Optimal</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Talk To Listen Ratio</span>
              </div>
              <span className="font-bold text-indigo-600">62% / 38%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/user/calls/report")}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <FileText className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>View Full Report</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>Download Report</span>
        </button>

        <button
          type="button"
          onClick={() => setIsNoteOpen(true)}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <FilePlus className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>Add Note</span>
        </button>

        <button
          type="button"
          onClick={() => setIsScheduleOpen(true)}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <Calendar className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>Schedule Follow Up</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/user/calls")}
          className="group bg-white border border-light-gray hover:border-primary/50 text-dark-black p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
        >
          <BarChart2 className="w-4 h-4 text-medium-black group-hover:text-primary transition-colors" />
          <span>Back To Calls</span>
        </button>

        <button
          type="button"
          onClick={onStartNewCall}
          className="bg-primary hover:bg-medium-teal text-white p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Phone className="w-4 h-4" />
          <span>Start New Call</span>
        </button>
      </div>

      <UpdateStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        value={status}
        onSelect={setStatus}
        options={statusOptions}
      />

      <PurchaseMoreModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
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

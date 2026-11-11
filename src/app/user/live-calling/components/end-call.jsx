"use client";

import React, { useEffect, useState } from "react";
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
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import PurchaseMoreModal from "./purchase-more-modal";
import UpdateStatusModal from "./update-status-modal";
import AddNoteModal from "./add-note-modal";
import ScheduleFollowUpModal from "./schedule-followup-modal";
import SendFollowUpEmailModal from "@/components/follow-up/send-follow-up-email-modal";
import CallNumberPanel from "@/components/contacts/call-number-panel";
import BadgeSelect from "@/components/shared/dropdown/badge-select";
import { outcomeOptions } from "@/utils.js/lead-options";
import { apiRequest } from "@/lib/client-api";

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

// ── The call that just ended (AI phase 2): facts the AI Core recorded ──
const RESOLUTION_TEXT = { unresolved: "still open", reactivated: "came back", clarified: "clarified", partial: "partly resolved", resolved: "resolved" };
const MEETING_TEXT = { walkthrough: "walkthrough", tour: "showing", strategy_meeting: "meeting", professional_meeting: "meeting" };
const clock = (ms) => {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

function liveInsights(summary) {
  if (!summary) return null;
  const items = [];
  const conversion = summary.conversion;
  items.push({ title: "Outcome", description: conversion ? `${MEETING_TEXT[conversion.type] ?? "Meeting"} ${conversion.status}` : summary.boundary ? "They asked not to be contacted again." : "No meeting set on this call." });
  if (summary.objections?.length) items.push({ title: "Objections", description: summary.objections.map((o) => `${o.label}: ${RESOLUTION_TEXT[o.resolution] ?? o.resolution}${o.recurrence_count > 1 ? ` (raised ${o.recurrence_count} times)` : ""}`).join(" · ") });
  if (summary.trust_gain?.value !== null && summary.trust_gain?.value !== undefined) items.push({ title: "Trust", description: `${Math.round(summary.trust_gain.start)} → ${Math.round(summary.trust_gain.end)} (${summary.trust_gain.value >= 0 ? "+" : ""}${Math.round(summary.trust_gain.value)})${summary.trust_gain.low_confidence ? ", early reading" : ""}` });
  items.push({ title: "AI coaching", description: `${summary.prompts_shown} line${summary.prompts_shown === 1 ? "" : "s"} suggested${summary.adherence_pct !== null ? `, followed ${summary.adherence_pct}% of the time` : ""}.` });
  if (summary.promises?.length) items.push({ title: "Follow-up owed", description: summary.promises.map((p) => p.text).join(" · ") });
  return items;
}

function liveParagraph(liveCall) {
  const summary = liveCall?.summary;
  if (!summary) return null;
  const minutes = Math.max(1, Math.round((summary.duration_ms ?? 0) / 60000));
  const kind = liveCall.call?.mode === "practice" ? "practice call" : "call";
  const parts = [`A ${minutes}-minute ${kind} with ${liveCall.call?.prospectName || liveCall.call?.contactName || "the prospect"}.`];
  if (summary.objections?.length) parts.push(`Objections: ${summary.objections.map((o) => `${o.label.toLowerCase()} (${RESOLUTION_TEXT[o.resolution] ?? o.resolution})`).join(", ")}.`);
  if (summary.conversion) parts.push(`A ${MEETING_TEXT[summary.conversion.type] ?? "meeting"} was ${summary.conversion.status}.`);
  else if (summary.boundary) parts.push("They asked not to be contacted again.");
  else parts.push("No meeting was set.");
  return parts.join(" ");
}

const EndCall = ({ setup = {}, onStartNewCall, outcome, onOutcomeChange, liveCall = null }) => {
  const insights = liveInsights(liveCall?.summary) ?? keyInsightsData;
  const transcript = liveCall?.turns?.length ? liveCall.turns.map((turn) => ({ speaker: turn.speaker === "rep" ? "Rep" : "Lead", time: clock(turn.atMs), text: turn.text })) : transcriptData;
  const callName = liveCall ? liveCall.call?.prospectName || liveCall.call?.contactName || setup.leadName : setup.leadName;
  const sum = liveCall?.summary ?? null;
  const resolvedCount = sum?.objections?.filter((o) => o.resolution === "resolved").length ?? 0;
  const stats = sum
    ? {
        duration: clock(sum.duration_ms),
        talk: sum.talk_ratio ? `${sum.talk_ratio.rep}%` : "—",
        listen: sum.talk_ratio ? `${sum.talk_ratio.prospect}%` : "—",
        trust: sum.trust ?? "—",
        adherence: sum.adherence_pct !== null && sum.adherence_pct !== undefined ? `${sum.adherence_pct}%` : "—",
        objections: sum.objections?.length ? `${resolvedCount} / ${sum.objections.length}` : "None",
        guidance: `${sum.prompts_shown} line${sum.prompts_shown === 1 ? "" : "s"}`,
        pacing: sum.pacing === null || sum.pacing === undefined ? "—" : sum.pacing >= 75 ? "In sync" : sum.pacing >= 55 ? "Slightly off" : "Off pace",
        ratio: sum.talk_ratio ? `${sum.talk_ratio.rep}% / ${sum.talk_ratio.prospect}%` : "—",
      }
    : { duration: "12:20 min", talk: "69%", listen: "31%", trust: 94, adherence: "82%", objections: "3 / 3", guidance: "High", pacing: "Optimal", ratio: "62% / 38%" };
  const callNumber = liveCall ? liveCall.call?.phoneNumber || (liveCall.call?.mode === "practice" ? "Practice call" : "") : setup.phoneNumber || "(310) 123-4567";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Key Insights");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [status, setStatus] = useState("Warm Lead");

  // The saved report for this call (AI-4)
  const callId = liveCall?.call?.id ?? null;
  const [reportData, setReportData] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  useEffect(() => {
    if (!callId) return;
    let cancelled = false;
    apiRequest(`/api/v1/calls/${encodeURIComponent(callId)}/report`)
      .then((result) => {
        if (cancelled) return;
        setReportData(result);
        if (result.call?.disposition) onOutcomeChange?.(result.call.disposition);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // onOutcomeChange is the page's state setter (stable); load once per call
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);
  const report = reportData?.report ?? null;
  const detailed = report?.detailed ?? null;
  const reportUsage = reportData?.usage ?? null;
  const isPractice = liveCall?.call?.mode === "practice";

  const unlockReport = async () => {
    setUnlocking(true);
    try {
      setReportData(await apiRequest(`/api/v1/calls/${encodeURIComponent(callId)}/report/unlock`, { method: "POST" }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUnlocking(false);
    }
  };

  // Saving the outcome on the call keeps Call History and the follow-up queue right
  const changeOutcome = (value) => {
    onOutcomeChange?.(value);
    if (callId) apiRequest(`/api/v1/calls/${encodeURIComponent(callId)}`, { method: "PATCH", body: { disposition: value || null } }).catch(() => {});
  };

  const reportHref = callId ? `/user/calls/report?id=${encodeURIComponent(callId)}` : "/user/calls/report";
  const handleDownloadReport = () => {
    if (callId) window.open(`${reportHref}&print=1`, "_blank", "noopener");
    else toast.error("There's no saved report for this call.");
  };

  // Tab contents: the real report when there is one
  const tabObjections = report ? (detailed ? detailed.objections.map((o) => ({ title: `${o.label} · ${o.resolution_label}`, description: `${o.first_quote ? `"${o.first_quote}" ` : ""}Raised ${o.times_raised} time${o.times_raised === 1 ? "" : "s"}${o.strategies.length ? `; approaches: ${o.strategies.join(" → ")}` : ""}.` })) : null) : objectionsData;
  const tabSentiment = report ? (detailed ? [{ title: `Overall: ${detailed.sentiment.overall}`, description: detailed.sentiment.basis }, ...detailed.trust_events.map((e) => ({ title: `Trust ${e.delta > 0 ? "+" : ""}${e.delta} at ${clock(e.at_ms)}`, description: `${e.why}${e.quote ? ` ("${e.quote}")` : ""}` }))] : null) : sentimentData;
  const tabActions = report ? report.action_items.map((a) => ({ title: { confirm_meeting: "Confirm the meeting", send_info: "Send information", prior_promise: "Earlier promise", prepare_objection: "Prepare", decision_maker: "Decision maker", do_not_call: "Do not call" }[a.type] ?? "Next step", description: a.text })) : actionItemsData;

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
              {callName && (
                <span className="text-base font-bold text-white">
                  {callName}
                </span>
              )}
              {callNumber && (
                <span className="text-sm sm:text-base font-semibold text-slate-200 tracking-wide">
                  {callNumber}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-bold text-[#00a884] tracking-tight">
              Ai Call Summary
            </h2>

            {/* Description Text */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl text-center">
              {report?.narrative ?? liveParagraph(liveCall) ?? "Today's call focused on introducing our AI-powered cold calling solution and understanding the client's current outreach process. We discussed their primary pain points, including low response rates and high time investment in manual dialing. The client expressed interest in automating their lead qualification process and improving conversion rates through personalized conversations. A live demo was scheduled for next week to showcase the platform's real-time voice capabilities, CRM integration, and analytics dashboard. The call concluded with the client requesting a pricing proposal and additional case studies for review before the demo."}
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
              <button
                type="button"
                onClick={() => setIsEmailOpen(true)}
                className="px-6 py-2.5 rounded-full border border-[#00a884]/40 bg-[#051824] hover:bg-[#082a32] text-xs sm:text-sm font-semibold text-slate-200 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send an email
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
              <span className="text-sm text-slate-300 font-medium">Detailed reports this month</span>
              <p className="text-lg text-slate-200 font-bold">{reportUsage ? `${reportUsage.used} / ${reportUsage.total} used` : "—"}</p>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-[#00a884] rounded-full" style={{ width: `${reportUsage?.total ? Math.min(100, Math.round((reportUsage.used / reportUsage.total) * 100)) : 0}%` }} />
              </div>
              {reportData && (
                <p className="text-xs text-slate-400">
                  {isPractice ? "Practice calls include the full report." : reportData.locked ? "This call's detailed report is locked." : "This call's detailed report is unlocked."}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-1">
              <h4 className="text-sm font-semibold text-slate-100">Need more reports?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Purchase additional reports to continue unlocking detailed call insights.
              </p>
            </div>

            {reportData?.locked && reportUsage?.remaining > 0 ? (
              <button
                type="button"
                onClick={unlockReport}
                disabled={unlocking}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-medium-teal text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              >
                {unlocking ? "Unlocking…" : "Unlock Detailed Report (uses 1)"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPurchaseOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-medium-teal text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
              >
                Buy More Reports
              </button>
            )}
          </div>
        </div>
      </div>

      {/* This number: its own status, and the contact's next number (calls started from CRM / Leads) */}
      <CallNumberPanel setup={setup} onCallNext={onStartNewCall} />

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
            onChange={changeOutcome}
            options={outcomeOptions}
            placeholder="Select Outcome"
            unselectedClassName="bg-transparent text-medium-black border-light-gray hover:bg-light-gray"
          />
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Duration</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">{stats.duration}</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Talk</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">{stats.talk}</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Listen Ratio</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">{stats.listen}</p>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-light-black uppercase tracking-wider">Trust Score</p>
          <p className="text-[13px] font-bold text-dark-black mt-0.5">{stats.trust}</p>
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
              (report ? report.key_insights.map((item) => ({ title: item.title, description: item.text })) : insights).map((item, index) => (
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
                {transcript.map((item, index) => (
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
                {tabObjections === null ? <p className="text-xs text-medium-black">Unlock the detailed report to see this.</p> : tabObjections.length === 0 ? <p className="text-xs text-medium-black">Nothing to show for this call.</p> : tabObjections.map((item, index) => (
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
                {tabSentiment === null ? <p className="text-xs text-medium-black">Unlock the detailed report to see this.</p> : tabSentiment.length === 0 ? <p className="text-xs text-medium-black">Nothing to show for this call.</p> : tabSentiment.map((item, index) => (
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
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${!report || report.disclosure.confirmed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{!report ? "Read at 00:08" : report.disclosure.confirmed ? `Read${report.disclosure.at_ms !== null ? ` at ${clock(report.disclosure.at_ms)}` : ""}` : "Not confirmed"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(report
                    ? [
                        ["Disclosure read", report.disclosure.confirmed ? "Yes" : "Not confirmed"],
                        ["Timestamp", report.disclosure.at_ms !== null ? clock(report.disclosure.at_ms) : "—"],
                        ["Consent objection", report.disclosure.events.some((e) => e.type === "consent_issue") ? "Yes" : "None"],
                        ["Recording saved", "No (transcription only)"],
                      ]
                    : [
                        ["Disclosure read", "Yes"],
                        ["Timestamp", "00:08"],
                        ["Consent objection", "None"],
                        ["Recording saved", "No (transcription only)"],
                      ]
                  ).map(([label, value]) => (
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
                {tabActions === null ? <p className="text-xs text-medium-black">Unlock the detailed report to see this.</p> : tabActions.length === 0 ? <p className="text-xs text-medium-black">Nothing to show for this call.</p> : tabActions.map((item, index) => (
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
              <span className="font-bold text-purple-600">{stats.adherence}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Objections handled</span>
              </div>
              <span className="font-bold text-emerald-600">{stats.objections}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Cpu className="w-3.5 h-3.5 text-teal-500" />
                <span>AI Guidance Used</span>
              </div>
              <span className="font-bold text-teal-600">{stats.guidance}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pacing</span>
              </div>
              <span className="font-bold text-emerald-600">{stats.pacing}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-medium-black">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Talk To Listen Ratio</span>
              </div>
              <span className="font-bold text-indigo-600">{stats.ratio}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push(reportHref)}
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

      {isEmailOpen && (
        <SendFollowUpEmailModal key="follow-up-email" onClose={() => setIsEmailOpen(false)} setup={{ ...setup, leadName: setup.leadName || liveCall?.call?.prospectName || liveCall?.call?.contactName }} mailPath="/user/settings/send-mail" callId={callId} suggestedPurpose={report?.follow_up?.suggested_purpose ?? null} facts={Object.fromEntries(Object.entries(report?.follow_up?.facts ?? {}).filter(([, value]) => value))} />
      )}

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

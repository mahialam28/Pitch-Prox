"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Download, FileText, Lock, Mail, Printer, ShieldAlert, ShieldCheck, Sparkles, TrendingDown, TrendingUp, User, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import SendFollowUpEmailModal from "@/components/follow-up/send-follow-up-email-modal";

// The post-call report (AI-4): everything comes from what the AI Core recorded on the call.
// Basic sections are always shown; the detailed analysis is unlocked per live call (one of the
// plan's reports). Tone of voice isn't measured and no outside statistics are quoted.

const clock = (ms) => {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};
const duration = (ms) => {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  return total >= 60 ? `${Math.floor(total / 60)}m ${total % 60}s` : `${total}s`;
};
const RESOLUTION_STYLE = { Resolved: "bg-emerald-100 text-emerald-700", "Partly resolved": "bg-amber-100 text-amber-800", Clarified: "bg-blue-100 text-blue-700", "Still open": "bg-rose-100 text-rose-700", "Came back": "bg-rose-100 text-rose-700", Boundary: "bg-slate-200 text-slate-700" };
const IMPACT_STYLE = { "High impact": "bg-emerald-100 text-emerald-700", Effective: "bg-blue-100 text-blue-700", "Lost ground": "bg-rose-100 text-rose-700" };

function Section({ number, title, children, aside = null }) {
  return (
    <section className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 break-inside-avoid">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-dark-black">
          {number}. {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-light-gray bg-light-gray/30 p-3.5">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-light-black">{label}</span>
      <span className="block text-lg font-bold text-dark-black mt-0.5">{value}</span>
      {sub && <span className="block text-[11px] text-light-black">{sub}</span>}
    </div>
  );
}

// Trust and engagement across the prospect's turns
function TrustChart({ points }) {
  if (!points?.length) return <p className="text-xs text-light-black">Not enough of the conversation to chart.</p>;
  const width = 640;
  const height = 160;
  const end = Math.max(1, points.at(-1).at_ms);
  const x = (ms) => 30 + ((width - 40) * ms) / end;
  const y = (value) => 10 + (height - 30) * (1 - value / 100);
  const line = (key) => points.map((p, i) => `${i ? "L" : "M"}${x(p.at_ms).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
  return (
    <figure>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Trust and engagement over the call">
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1="30" x2={width - 10} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeDasharray={v === 50 ? "4 4" : undefined} />
            <text x="0" y={y(v) + 4} fontSize="10" fill="#94a3b8">{v}</text>
          </g>
        ))}
        <path d={line("engagement")} fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.7" />
        <path d={line("trust")} fill="none" stroke="#00a884" strokeWidth="2.5" />
        {points.map((p) => <circle key={p.at_ms} cx={x(p.at_ms)} cy={y(p.trust)} r="3" fill="#00a884" />)}
        <text x="30" y={height - 2} fontSize="10" fill="#94a3b8">00:00</text>
        <text x={width - 40} y={height - 2} fontSize="10" fill="#94a3b8">{clock(end)}</text>
      </svg>
      <figcaption className="mt-1 flex gap-4 text-[11px] text-medium-black">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#00a884]" /> Trust</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#8b5cf6]" /> Engagement</span>
      </figcaption>
    </figure>
  );
}

function LockedCard({ usage, onUnlock, unlocking, error }) {
  const left = usage ? usage.remaining : null;
  return (
    <section className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center break-inside-avoid">
      <Lock className="w-6 h-6 text-primary mx-auto" />
      <h2 className="mt-2 text-base font-bold text-dark-black">Detailed report</h2>
      <p className="mt-1 text-sm text-medium-black max-w-md mx-auto">Key moments, prompt use, objections analysis, trust timeline and coaching for this call.</p>
      {left !== null && <p className="mt-1 text-xs text-light-black">{usage.used} of {usage.total} detailed reports used this month.</p>}
      {error && <p className="mt-2 text-xs font-semibold text-red">{error}</p>}
      {left === 0 ? (
        <Link href="/user/settings/billing" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal">Buy more reports</Link>
      ) : (
        <button type="button" onClick={onUnlock} disabled={unlocking} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal disabled:opacity-60 cursor-pointer">
          <Sparkles className="w-4 h-4" /> {unlocking ? "Unlocking…" : "Unlock (uses 1 report)"}
        </button>
      )}
    </section>
  );
}

export default function CallReportView({ callId, autoPrint = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiRequest(`/api/v1/calls/${encodeURIComponent(callId)}/report`)
      .then((result) => !cancelled && setData(result))
      .catch((requestError) => !cancelled && setError(requestError.message));
    return () => {
      cancelled = true;
    };
  }, [callId]);

  useEffect(() => {
    if (!autoPrint || !data?.report) return;
    const id = setTimeout(() => window.print(), 400);
    return () => clearTimeout(id);
  }, [autoPrint, data]);

  const unlock = async () => {
    setUnlocking(true);
    setUnlockError("");
    try {
      setData(await apiRequest(`/api/v1/calls/${encodeURIComponent(callId)}/report/unlock`, { method: "POST" }));
    } catch (requestError) {
      setUnlockError(requestError.message);
    } finally {
      setUnlocking(false);
    }
  };

  if (error) return <div className="rounded-2xl border border-light-gray bg-white p-8 text-center text-sm text-medium-black">{error}</div>;
  if (!data) return <div className="rounded-2xl border border-light-gray bg-white p-8 text-center text-sm text-light-black" aria-busy="true">Loading the report…</div>;
  const { call, report, locked, usage } = data;
  if (!report) return <div className="rounded-2xl border border-light-gray bg-white p-8 text-center text-sm text-medium-black">This call ended before the prospect spoke, so there&apos;s no report.</div>;
  const detailed = report.detailed;
  const facts = Object.fromEntries(Object.entries(report.follow_up?.facts ?? {}).filter(([, value]) => value));

  return (
    <div className="w-full space-y-5 print:space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/user/calls" className="print:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-medium-black hover:text-primary mb-1"><ArrowLeft className="w-3.5 h-3.5" /> Calls</Link>
          <h1 className="text-[24px] font-bold text-dark-black tracking-tight">Call Report</h1>
          <p className="text-[13px] text-light-black mt-0.5">Transcript only, no audio is stored{call.mode === "practice" ? " · Practice call" : ""}</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          {report.follow_up?.suggested_purpose && (
            <button type="button" onClick={() => setEmailOpen(true)} className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-primary rounded-xl hover:bg-medium-teal cursor-pointer"><Mail className="h-4 w-4" /> Follow-up email</button>
          )}
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-dark-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 cursor-pointer"><Download className="h-4 w-4" /> Download PDF</button>
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-dark-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 cursor-pointer"><Printer className="h-4 w-4" /> Print</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Call ID" value={call.id.slice(-8).toUpperCase()} />
        <Stat label="Prospect" value={call.contactName || "—"} sub={call.leadType || null} />
        <Stat label="Date" value={new Date(call.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} sub={new Date(call.startedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} />
        <Stat label="Length" value={duration(report.duration_ms)} sub={call.playbook || null} />
        <Stat label="Outcome" value={report.outcome.label} sub={report.outcome.conversion?.when?.text ?? null} />
      </div>

      {/* 1. Summary */}
      <Section number={1} title="Call Summary">
        <p className="text-sm text-medium-black leading-relaxed">{report.narrative}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.key_insights.map((item) => (
            <div key={item.title + item.text} className="rounded-xl border border-light-gray p-3.5">
              <h3 className="text-[13px] font-bold text-dark-black">{item.title}</h3>
              <p className="text-xs text-medium-black mt-0.5 leading-relaxed">{item.text}</p>
              {item.quote && <p className="text-xs text-light-black italic mt-1">&ldquo;{item.quote}&rdquo;</p>}
            </div>
          ))}
        </div>
        {report.action_items.length > 0 && (
          <div className="mt-4">
            <h3 className="text-[13px] font-bold text-dark-black mb-2">Action items</h3>
            <ul className="space-y-1.5">
              {report.action_items.map((item) => (
                <li key={item.type + item.text} className="flex items-start gap-2 text-sm text-medium-black">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item.text}{item.quote ? <span className="text-light-black italic"> &ldquo;{item.quote}&rdquo;</span> : null}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {locked || !detailed ? (
        <LockedCard usage={usage} onUnlock={unlock} unlocking={unlocking} error={unlockError} />
      ) : (
        <>
          {/* 2. Key moments */}
          <Section number={2} title="Key Moments" aside={<span className="text-[11px] text-light-black">What PitchProX suggested, what you said, and how they reacted</span>}>
            {detailed.moments.length === 0 ? (
              <p className="text-sm text-light-black">No lines were suggested on this call.</p>
            ) : (
              <ol className="space-y-3">
                {detailed.moments.map((moment, index) => (
                  <li key={index} className="rounded-xl border border-light-gray p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{moment.action}</span>
                      {moment.at_ms !== null && <span className="text-[11px] text-light-black">{clock(moment.at_ms)}</span>}
                      <span className="text-[11px] font-semibold text-medium-black">· {moment.behavior}</span>
                      {moment.impact && <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${IMPACT_STYLE[moment.impact]}`}>{moment.impact}</span>}
                    </div>
                    <p className="mt-1.5 text-sm text-dark-black">&ldquo;{moment.prompt}&rdquo;</p>
                    {moment.rep_said && moment.rep_said !== moment.prompt && <p className="mt-1 text-xs text-medium-black"><span className="font-semibold">You said:</span> {moment.rep_said}</p>}
                    {moment.prospect_reaction && <p className="mt-1 text-xs text-medium-black"><span className="font-semibold">They said:</span> {moment.prospect_reaction}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {/* 3. Performance */}
          <Section number={3} title="Performance" aside={<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary" title="Conversation quality, separate from the outcome">Conversation score {detailed.scores.conversation}</span>}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Lines used" value={`${detailed.prompt_use.used_pct}%`} sub={`${detailed.prompt_use.used_as_is_or_own_words} of ${detailed.prompt_use.shown} (as written or own words)`} />
              <Stat label="Own approach" value={`${detailed.prompt_use.own_approach_pct}%`} sub="worked without the line" />
              <Stat label="Off-script" value={`${detailed.prompt_use.off_script_pct}%`} sub="skipped or hurt the call" />
              <Stat label="Talk ratio" value={detailed.talk_ratio ? `${detailed.talk_ratio.rep}% / ${detailed.talk_ratio.prospect}%` : "—"} sub="you / prospect" />
            </div>
            {detailed.coaching.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[13px] font-bold text-dark-black mb-2">Coaching</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {detailed.coaching.map((item) => (
                    <li key={item.title} className={`rounded-xl border p-3 ${item.type === "strength" ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                      <span className="flex items-center gap-1.5 text-[13px] font-bold text-dark-black">
                        {item.type === "strength" ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-amber-600" />} {item.title}
                      </span>
                      <span className="block text-xs text-medium-black mt-0.5">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          {/* 4. Objections & conversion */}
          <Section number={4} title="Objections & Conversion" aside={<span className={`rounded-full px-3 py-1 text-xs font-bold ${report.outcome.success ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{report.outcome.success ? "SUCCESS" : report.outcome.label.toUpperCase()}</span>}>
            {detailed.objections.length === 0 ? (
              <p className="text-sm text-light-black">No objections came up.</p>
            ) : (
              <div className="space-y-2.5">
                {detailed.objections.map((objection) => (
                  <div key={objection.id} className="rounded-xl border border-light-gray p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span className="text-[13px] font-bold text-dark-black">{objection.label}</span>
                      {objection.root.length > 0 && <span className="text-[11px] text-light-black capitalize">{objection.root.join(", ")}</span>}
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${RESOLUTION_STYLE[objection.resolution_label] ?? "bg-slate-100 text-slate-700"}`}>{objection.resolution_label}</span>
                    </div>
                    {objection.first_quote && <p className="mt-1 text-xs text-medium-black italic">&ldquo;{objection.first_quote}&rdquo;</p>}
                    <p className="mt-1 text-xs text-light-black">Raised {objection.times_raised} time{objection.times_raised === 1 ? "" : "s"}{objection.strategies.length ? ` · approaches used: ${objection.strategies.join(" → ")}` : ""}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Readiness at the end" value={detailed.scores.readiness_end ?? "—"} />
              <Stat label="Momentum" value={detailed.scores.momentum_end ? detailed.scores.momentum_end.score : "—"} sub={detailed.scores.momentum_end?.trend ?? null} />
              <Stat label="Engagement (avg)" value={detailed.scores.engagement_avg ?? "—"} />
              <Stat label="Pacing (avg)" value={detailed.scores.pacing_avg ?? "—"} />
            </div>
          </Section>

          {/* 5. Trust & sentiment */}
          <Section number={5} title="Trust & Sentiment" aside={<span className="text-xs font-semibold text-medium-black">Overall: {detailed.sentiment.overall}</span>}>
            <TrustChart points={detailed.chart} />
            {detailed.trust_events.length > 0 && (
              <ul className="mt-4 space-y-2">
                {detailed.trust_events.map((event) => (
                  <li key={event.at_ms} className="flex items-start gap-2.5 text-xs">
                    <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-bold ${event.delta > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{event.delta > 0 ? "+" : ""}{event.delta}</span>
                    <span className="text-light-black shrink-0">{clock(event.at_ms)}</span>
                    <span className="text-medium-black">{event.why}{event.quote ? <span className="italic text-light-black"> &ldquo;{event.quote}&rdquo;</span> : null}</span>
                  </li>
                ))}
              </ul>
            )}
            {detailed.sentiment.emotions_seen.length > 0 && <p className="mt-3 text-xs text-medium-black">Most likely moods: {detailed.sentiment.emotions_seen.slice(0, 4).map((e) => e.state).join(", ")}.</p>}
            <p className="mt-2 text-[11px] text-light-black">{detailed.sentiment.basis}</p>
          </Section>
        </>
      )}

      {/* Disclosure */}
      <Section number={locked || !detailed ? 2 : 6} title="Disclosure">
        <div className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${report.disclosure.confirmed ? "border-emerald-200 bg-emerald-50/60 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
          {report.disclosure.confirmed ? <ShieldCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {report.disclosure.confirmed ? `AI assistance disclosure read${report.disclosure.at_ms !== null ? ` at ${clock(report.disclosure.at_ms)}` : ""}.` : "The disclosure wasn't confirmed on this call."}
        </div>
        {report.disclosure.events.some((e) => e.type !== "disclosure_detected") && <p className="mt-2 text-xs text-medium-black">Also logged: {report.disclosure.events.filter((e) => e.type !== "disclosure_detected").map((e) => `${e.type.replace(/_/g, " ")}${e.at_ms !== null ? ` (${clock(e.at_ms)})` : ""}`).join(", ")}.</p>}
      </Section>

      {/* Transcript */}
      <Section number={locked || !detailed ? 3 : 7} title="Transcript">
        <div className="space-y-2 max-h-[420px] overflow-y-auto print:max-h-none print:overflow-visible">
          {call.transcript.map((turn) => (
            <div key={turn.seq} className="flex gap-3 text-sm">
              <span className={`shrink-0 w-14 text-xs font-bold ${turn.speaker === "rep" ? "text-primary" : "text-blue-600"}`}>{turn.speaker === "rep" ? "You" : "Prospect"}</span>
              <span className="shrink-0 text-xs text-light-black w-10">{clock(turn.endMs)}</span>
              <span className="text-medium-black">{turn.text}</span>
            </div>
          ))}
        </div>
      </Section>

      <p className="text-[11px] text-light-black flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Report {report.version} · <Calendar className="w-3.5 h-3.5" /> {new Date(report.generated_at).toLocaleString("en-US")} · <User className="w-3.5 h-3.5" /> {call.playbook} · <Clock className="w-3.5 h-3.5" /> scoring {report.versions?.scoring}</p>

      {emailOpen && (
        <SendFollowUpEmailModal key="report-follow-up" onClose={() => setEmailOpen(false)} setup={{ leadName: call.contactName, phoneNumber: call.phoneNumber }} callId={call.id} suggestedPurpose={report.follow_up.suggested_purpose} facts={facts} mailPath="/user/settings/send-mail" />
      )}
    </div>
  );
}

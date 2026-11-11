"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Bot, BotOff, Cpu, GraduationCap, Loader2, Phone, PhoneOff, Search, Send, ShieldCheck, Smile, Sparkles, Check, AlertTriangle } from "lucide-react";
import LiveCallingModal from "./live-calling-modal";
import { useLiveCall } from "../use-live-call";
import { PENDING_CALL_KEY, PENDING_CALL_EVENT } from "@/utils.js/call-constants";

// Live calling screen (AI phase 2): every value comes from the AI Core in the call service —
// the transcript, the exact line to say (teleprompter), session status and the live metrics.
// Until phone calls are connected (Twilio, AI-3), practice calls use a simulated prospect.

const STATUS = {
  idle: { label: "Ready to start", tone: "green", orb: "Tap to start" },
  connecting: { label: "Connecting…", tone: "blue", orb: "Connecting…" },
  listening: { label: "Listening…", tone: "blue", orb: "Listening…" },
  thinking: { label: "Analyzing…", tone: "purple", orb: "Analyzing…" },
  prompt_ready: { label: "Prompt ready", tone: "green", orb: "Say the line" },
  ai_paused: { label: "AI paused", tone: "amber", orb: "AI paused" },
  boundary: { label: "Do not contact: wrap up", tone: "amber", orb: "Wrap up" },
  script_finished: { label: "Scenario finished", tone: "green", orb: "End the call" },
  ending: { label: "Saving the call…", tone: "blue", orb: "Saving…" },
  ended: { label: "Call ended", tone: "blue", orb: "Call ended" },
};
const TONES = {
  green: "bg-[#0b2830] text-[#00a884] border-[#00a884]/30",
  blue: "bg-[#0b2830] text-[#7dd3fc] border-[#7dd3fc]/30",
  purple: "bg-[#1d1235] text-purple-300 border-purple-400/30",
  amber: "bg-[#2a1608] text-amber-400 border-amber-400/30",
};
const DOTS = { green: "bg-[#00a884]", blue: "bg-[#7dd3fc]", purple: "bg-purple-300", amber: "bg-amber-400" };
const ACTION_LABELS = { acknowledge: "Acknowledge", clarify: "Clarify", validate: "Validate", mirror: "Mirror", reframe: "Reframe", educate: "Answer", quantify: "Quantify", differentiate: "Differentiate", "de-risk": "De-risk", social_proof: "Social proof", challenge: "Challenge", future_pace: "Future pace", question: "Ask", close: "Ask for the meeting" };
const RESOLUTION = { unresolved: "open", reactivated: "back again", clarified: "clarified", partial: "partly resolved", resolved: "resolved" };
const mmss = (ms) => {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs min-w-0">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone.bg}`}>
        <Icon className={`w-4 h-4 ${tone.text}`} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">{label}</span>
        <span className={`text-[13px] font-bold truncate ${tone.text}`} title={typeof value === "string" ? value : undefined}>{value}</span>
      </div>
    </div>
  );
}

export const StartCall = ({ onCallEnded, setup = {}, onSetupChange = () => {} }) => {
  const live = useLiveCall();
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [booted, setBooted] = useState(false);
  const [repText, setRepText] = useState("");
  const [prospectText, setProspectText] = useState("");
  const startRef = useRef(null);
  const transcriptRef = useRef(null);
  const handedOff = useRef(false);

  const active = ["connecting", "active", "ending"].includes(live.phase);
  const status = STATUS[live.status] ?? STATUS.listening;
  const metrics = live.metrics;
  const practice = live.call?.mode === "practice";
  const roleplay = Boolean(live.call?.practice?.roleplay);

  const begin = useCallback(
    (next) => {
      handedOff.current = false;
      setIsSetupOpen(false);
      live.start(next);
    },
    [live]
  );
  useEffect(() => {
    startRef.current = begin;
  });

  // The call ended (saved by the call service): show the after-call screen once
  useEffect(() => {
    if (live.phase !== "ended" || handedOff.current) return;
    handedOff.current = true;
    const turns = live.turns;
    const summary = live.summary;
    const id = setTimeout(() => onCallEnded?.({ summary, turns, call: live.call }), 0);
    return () => clearTimeout(id);
  }, [live.phase, live.turns, live.summary, live.call, onCallEnded]);

  // Keep the newest transcript line in view
  useEffect(() => {
    const box = transcriptRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [live.turns.length]);

  // A call started from the header / CRM / Leads (sessionStorage) starts here as a phone call
  const consumePendingCall = useCallback(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(PENDING_CALL_KEY);
    if (!raw) return null;
    try {
      sessionStorage.removeItem(PENDING_CALL_KEY);
      const saved = JSON.parse(raw);
      const next = { ...setup, contactKind: null, contactId: null, phoneId: null, ...saved, mode: "live" };
      onSetupChange(next);
      return next;
    } catch {
      return null;
    }
  }, [onSetupChange, setup]);

  useEffect(() => {
    const id = setTimeout(() => {
      const pending = consumePendingCall();
      setBooted(true);
      if (pending) startRef.current?.(pending);
    }, 0);
    const handleHeaderStart = () => {
      const pending = consumePendingCall();
      if (pending) startRef.current?.(pending);
    };
    window.addEventListener(PENDING_CALL_EVENT, handleHeaderStart);
    return () => {
      clearTimeout(id);
      window.removeEventListener(PENDING_CALL_EVENT, handleHeaderStart);
    };
  }, [consumePendingCall]);

  const sayLine = (text) => {
    live.say(text);
    setRepText("");
  };
  const submitRep = (event) => {
    event.preventDefault();
    sayLine(repText);
  };
  const submitProspect = (event) => {
    event.preventDefault();
    live.prospectSay(prospectText);
    setProspectText("");
  };

  const name = live.call?.prospectName || live.call?.contactName || setup.leadName || "";
  const badge = live.phase === "error" ? { label: "Call couldn't continue", tone: "amber" } : active || live.phase === "ended" ? status : STATUS.idle;
  const trust = metrics && live.turns.some((t) => t.speaker === "prospect") ? `${metrics.trust}%${metrics.trustConfident ? "" : " (early)"}` : "—";
  const aiPaused = metrics?.aiAllowed === false;

  return (
    <div className="w-full font-sans text-[#1e293b]">
      <LiveCallingModal isOpen={booted && isSetupOpen && !active} onClose={() => setIsSetupOpen(false)} setup={setup} onSetupChange={onSetupChange} onStartCall={begin} />

      <div className="w-full bg-[#030d1a] rounded-2xl p-5 sm:p-8 text-white border border-slate-800/60 shadow-xl">
        <div className="relative flex flex-col items-center pt-2 pb-4 min-h-[560px] gap-5">
          {/* Header: status, who, playbook */}
          <div className="flex flex-col items-center gap-2 z-1 text-center">
            <div className={`text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 border transition-colors ${TONES[badge.tone]}`} aria-live="polite">
              <span className={`w-2 h-2 rounded-full ${DOTS[badge.tone]} ${live.status === "thinking" ? "animate-pulse" : ""}`} />
              <span>{badge.label}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide mt-1">{name || (active ? "Connecting…" : "Select a lead to begin")}</h3>
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[12px] font-medium text-slate-300 bg-[#0a1b2a] border border-slate-700/60 rounded-full px-3.5 py-1">{live.call?.playbook || setup.playbook || "PitchProX Standard"}</span>
              {practice && (
                <span className="text-[12px] font-medium text-amber-300 bg-[#2a1608] border border-amber-400/30 rounded-full px-3 py-1 inline-flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Practice{live.call?.practice?.scenario ? `: ${live.call.leadType ?? "simulated prospect"}` : ""}
                </span>
              )}
              {live.call?.ai === "demo" && <span className="text-[11px] font-medium text-slate-400 border border-slate-700/60 rounded-full px-2.5 py-1" title="No AI key is configured on this server, so lines come from built-in sample wording. The strategy is the real Core.">Sample wording</span>}
            </div>

            {/* Disclosure: read at the start of every call; confirming it is logged to the call record */}
            {(live.phase === "active" || live.phase === "ending") && live.call?.disclosure && (
              <div className="mt-2 max-w-md flex items-start gap-2.5 text-left bg-[#051824] border border-[#00a884]/40 rounded-xl px-3.5 py-2.5">
                <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed text-slate-200 flex-1">
                  <span className="font-bold text-[#00a884] block">Disclosure</span>
                  &ldquo;{live.call.disclosure}&rdquo;
                </span>
                {live.disclosureLogged ? (
                  <span className="text-[11px] font-semibold text-[#00a884] inline-flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> Logged</span>
                ) : (
                  <button type="button" onClick={live.markDisclosure} className="text-[11px] font-semibold text-[#030d1a] bg-[#00a884] hover:bg-[#00c49a] rounded-lg px-2.5 py-1 shrink-0 cursor-pointer">I read it</button>
                )}
              </div>
            )}
          </div>

          {/* Teleprompter: the exact line to say next */}
          <div className="w-full max-w-2xl">
            {live.phase === "idle" && (
              <button type="button" onClick={() => setIsSetupOpen(true)} className="mx-auto flex h-44 w-44 sm:h-48 sm:w-48 items-center justify-center rounded-full bg-gradient-to-b from-[#8b5cf6] via-[#5b21b6] to-[#1e1b4b] shadow-[0_0_55px_rgba(139,92,246,0.3)] border border-purple-400/30 text-sm sm:text-base font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer">
                Tap to start
              </button>
            )}
            {live.phase === "connecting" && (
              <div className="flex flex-col items-center gap-3 py-12 text-slate-300">
                <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
                <span className="text-sm">Connecting to the AI…</span>
              </div>
            )}
            {live.phase === "error" && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-200 flex flex-col sm:flex-row sm:items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="flex-1">{live.error}</span>
                <button type="button" onClick={() => { live.reset(); onSetupChange({ ...setup, mode: "practice" }); setIsSetupOpen(true); }} className="text-xs font-semibold text-[#030d1a] bg-amber-300 hover:bg-amber-200 rounded-lg px-3 py-1.5 cursor-pointer">
                  Start a practice call
                </button>
              </div>
            )}
            {(live.phase === "active" || live.phase === "ending") && (
              <div className={`rounded-2xl border px-5 py-5 sm:px-6 transition-colors ${live.prompt ? "border-[#00a884]/60 bg-[#06221f]" : "border-slate-700/60 bg-[#071425]"}`} aria-live="polite">
                {live.prompt ? (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a884]">Say this · {ACTION_LABELS[live.prompt.action] ?? live.prompt.action}</span>
                      {live.prompt.latencyMs !== undefined && <span className="text-[10px] text-slate-500">{live.prompt.latencyMs} ms</span>}
                    </div>
                    <p className="text-lg sm:text-xl font-semibold leading-relaxed text-white">{live.prompt.text}</p>
                    <button type="button" onClick={() => sayLine(live.prompt.text)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#030d1a] bg-[#00a884] hover:bg-[#00c49a] rounded-lg px-3.5 py-2 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> I said it
                    </button>
                  </>
                ) : live.opener && practice ? (
                  <>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Your opening line</span>
                    <p className="text-lg sm:text-xl font-semibold leading-relaxed text-white">{live.opener}</p>
                    <button type="button" onClick={() => sayLine(live.opener)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#030d1a] bg-[#00a884] hover:bg-[#00c49a] rounded-lg px-3.5 py-2 cursor-pointer">
                      <Phone className="w-3.5 h-3.5" /> Say it
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-slate-300 min-h-[64px]">
                    {live.status === "thinking" ? <Loader2 className="w-5 h-5 animate-spin text-purple-300" /> : <Activity className="w-5 h-5 text-[#7dd3fc]" />}
                    <span className="text-sm">
                      {live.status === "thinking" ? "Reading the moment…" : live.status === "script_finished" ? "That's the end of this scenario. End the call to see the summary." : live.status === "boundary" ? "They asked not to be contacted. Thank them and end the call." : aiPaused ? "AI coaching is paused. Resume it any time." : "Listening. A line appears here when it helps."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live transcript + what the rep said */}
          {(live.phase === "active" || live.phase === "ending" || (live.phase === "error" && live.turns.length > 0)) && (
            <div className="w-full max-w-2xl">
              <div ref={transcriptRef} className="max-h-56 overflow-y-auto rounded-2xl border border-slate-800 bg-[#050f1d] px-4 py-3 space-y-2" aria-label="Live transcript">
                {live.turns.length === 0 ? (
                  <p className="text-xs text-slate-500">The transcript appears here as the conversation happens.</p>
                ) : (
                  live.turns.map((turn) => (
                    <div key={turn.id} className="text-[13px] leading-relaxed">
                      <span className={`font-semibold mr-1.5 ${turn.speaker === "rep" ? "text-[#00a884]" : "text-[#7dd3fc]"}`}>{turn.speaker === "rep" ? "You" : name || "Prospect"}</span>
                      <span className="text-[10px] text-slate-500 mr-2">{mmss(turn.atMs)}</span>
                      <span className="text-slate-200">{turn.text}</span>
                    </div>
                  ))
                )}
              </div>
              {live.phase === "active" && (
                <div className="mt-2 space-y-2">
                  <form onSubmit={submitRep} className="flex gap-2">
                    <input value={repText} onChange={(e) => setRepText(e.target.value)} placeholder={practice ? "Or type what you said…" : "Type a note of what you said…"} aria-label="What you said" className="flex-1 min-w-0 rounded-xl bg-[#071425] border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00a884]" />
                    <button type="submit" disabled={!repText.trim()} className="rounded-xl bg-[#0b2830] border border-[#00a884]/40 px-3.5 text-[#00a884] disabled:opacity-40 cursor-pointer" aria-label="Send what you said"><Send className="w-4 h-4" /></button>
                  </form>
                  {roleplay && (
                    <form onSubmit={submitProspect} className="flex gap-2">
                      <input value={prospectText} onChange={(e) => setProspectText(e.target.value)} placeholder="Prospect says…" aria-label="What the prospect said" className="flex-1 min-w-0 rounded-xl bg-[#071425] border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#7dd3fc]" />
                      <button type="submit" disabled={!prospectText.trim()} className="rounded-xl bg-[#0b2830] border border-[#7dd3fc]/40 px-3.5 text-[#7dd3fc] disabled:opacity-40 cursor-pointer" aria-label="Send what the prospect said"><Send className="w-4 h-4" /></button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="w-full mt-auto pt-2 px-1">
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-3">
              <div className="order-2 sm:order-1 bg-[#051824] border border-[#00a884]/40 rounded-2xl px-4 py-3 flex items-center gap-3 sm:min-w-[170px]">
                <Cpu className="w-5 h-5 text-[#00a884] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider">Call</span>
                  <span className="text-xs sm:text-sm font-bold text-[#00a884] truncate">{active ? (practice ? "Practice" : "Live") : "Not started"}</span>
                </div>
              </div>

              <div className="order-1 sm:order-2 col-span-2 justify-self-center bg-[#00a884] p-1.5 rounded-full flex items-center gap-2 shadow-lg">
                {live.phase === "active" && (
                  <button type="button" onClick={() => live.setAiPaused(!aiPaused)} title={aiPaused ? "Resume AI coaching" : "Pause AI coaching"} aria-label={aiPaused ? "Resume AI coaching" : "Pause AI coaching"} className="w-12 h-12 rounded-full bg-[#082a32] hover:bg-[#062026] flex items-center justify-center transition-colors cursor-pointer">
                    {aiPaused ? <BotOff className="w-5 h-5 text-amber-400" /> : <Bot className="w-5 h-5 text-white" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={active ? live.end : () => setIsSetupOpen(true)}
                  disabled={live.phase === "ending" || live.phase === "connecting"}
                  title={active ? "End call" : "Start call"}
                  aria-label={active ? "End call" : "Start call"}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60 ${active ? "bg-[#ff4d4d] hover:bg-red-600" : "bg-[#062026] hover:bg-[#04161c]"}`}
                >
                  {live.phase === "ending" ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : active ? <PhoneOff className="w-5 h-5 text-white" /> : <Phone className="w-5 h-5 text-[#00a884]" />}
                </button>
              </div>

              <div className="order-3 bg-[#051824] border border-[#00a884]/40 rounded-2xl px-4 py-3 flex items-center gap-3 sm:min-w-[170px]">
                <svg className="w-6 h-6 fill-red-500/20 stroke-red-500 shrink-0" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider">Trust Score</span>
                  <span className="text-xs sm:text-sm font-bold text-[#00a884]" title="Inferred from what the prospect says and how the conversation moves. Early in a call it's a rough reading.">{trust}{metrics && trust !== "—" && metrics.trustTrend !== "stable" ? (metrics.trustTrend === "rising" ? " ↑" : " ↓") : ""}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        <MetricCard icon={Cpu} label="AI Guidance" value={!active ? "Idle" : aiPaused ? "Paused" : status.label.replace("…", "")} tone={{ bg: "bg-primary/10", text: "text-primary" }} />
        <MetricCard icon={Sparkles} label="Prompt Adherence" value={metrics?.adherence !== null && metrics?.adherence !== undefined ? `${metrics.adherence}%` : "—"} tone={{ bg: "bg-purple-50", text: "text-purple-600" }} />
        <MetricCard icon={Search} label="Objection Detected" value={metrics?.objection ? `${metrics.objection.label} (${RESOLUTION[metrics.objection.resolution] ?? metrics.objection.resolution})` : "None"} tone={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <MetricCard icon={Smile} label="Sentiment" value={metrics && live.turns.length ? metrics.sentiment : "Neutral"} tone={{ bg: "bg-blue-50", text: "text-blue-600" }} />
        <MetricCard icon={Activity} label="Pacing" value={metrics?.pacing?.label ?? "Waiting"} tone={{ bg: "bg-primary/10", text: "text-primary" }} />
      </div>
    </div>
  );
};

export default StartCall;

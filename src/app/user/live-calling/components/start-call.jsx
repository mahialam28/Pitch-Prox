"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Cpu,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Search,
  Smile,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import LiveCallingModal from "./live-calling-modal";
import {
  PENDING_CALL_KEY,
  PENDING_CALL_EVENT,
} from "@/utils.js/call-constants";

const WAVE_POINTS = 72;

const TRANSCRIPT_LINES = [
  "I can scroll to view my upcoming meetings and choose whether to have Fireflies join by toggling it on or off.",
  "That sounds great — let's set up a 15-minute walkthrough for next Tuesday morning.",
  "Absolutely, we integrate with Slack and Microsoft Teams out of the box.",
  "How many seats would you estimate your team needs this quarter?",
  "Perfect, I'll add that to the notes. Anything else you'd like to cover before we wrap up?",
];

export const StartCall = ({ onCallEnded, setup = {}, onSetupChange = () => {} }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [booted, setBooted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micError, setMicError] = useState("");
  const [transcriptIndex, setTranscriptIndex] = useState(0);

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const timeDataRef = useRef(null);
  const rafRef = useRef(null);
  const waveRef = useRef(new Array(WAVE_POINTS).fill(0));
  const wavePathRef = useRef(null);
  const isMutedRef = useRef(false);
  const isCallActiveRef = useRef(false);
  const speakingRef = useRef(false);
  const isStartingRef = useRef(false);
  const startCallRef = useRef(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  // Stop and release all audio resources (shared by endCall + unmount cleanup)
  const stopAudio = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    timeDataRef.current = null;
  }, []);

  // Rotate the simulated live transcript while the call is active
  useEffect(() => {
    if (!isCallActive) return;
    const id = setInterval(() => {
      setTranscriptIndex((i) => (i + 1) % TRANSCRIPT_LINES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [isCallActive]);

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  /**
   * Real-time waveform render loop.
   * Reads live microphone time-domain samples and draws a smooth recorder-style
   * curve directly onto the SVG path node (bypassing React re-renders for
   * buttery 60fps). The line oscillates above AND below the center like an
   * oscilloscope/recorder waveform.
   */
  function renderWave(time) {
    const analyser = analyserRef.current;
    if (!analyser || !timeDataRef.current) return;

    analyser.getByteTimeDomainData(timeDataRef.current);
    const data = timeDataRef.current;
    const muted = isMutedRef.current;

    const n = WAVE_POINTS;
    const step = Math.max(1, Math.floor(data.length / n));
    const raw = new Array(n);
    for (let i = 0; i < n; i++) {
      const idx = Math.min(data.length - 1, i * step);
      // Uint8 samples are centered on 128; convert to a signed -1..1 signal
      raw[i] = muted ? 0 : (data[idx] - 128) / 128;
    }

    // Temporal smoothing to calm jittery peaks
    const prev = waveRef.current;
    const smoothed = new Array(n);
    for (let i = 0; i < n; i++) {
      smoothed[i] = prev[i] * 0.65 + raw[i] * 0.35;
    }
    waveRef.current = smoothed;

    // Gentle symmetric idle ripple so the line stays alive during silence
    const t = time / 1000;
    const idle = isCallActiveRef.current ? 0.04 : 0;

    // Build the smooth curve path
    const xStep = 1000 / (n - 1);
    let d = "";
    for (let i = 0; i < n; i++) {
      const ripple = idle * Math.sin(t * 2.4 + i * 0.45);
      const y = 60 - (smoothed[i] + ripple) * 55;
      d += `${i === 0 ? "M" : " L"} ${(i * xStep).toFixed(1)},${y.toFixed(1)}`;
    }
    if (wavePathRef.current) wavePathRef.current.setAttribute("d", d);

    // Speaking detection (average absolute deviation from silence)
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.abs(smoothed[i]);
    const speaking = isCallActiveRef.current && !muted && sum / n > 0.12;
    if (speaking !== speakingRef.current) {
      speakingRef.current = speaking;
      setIsSpeaking(speaking);
    }

    rafRef.current = requestAnimationFrame(renderWave);
  }

  const startCall = async (allowSimulation = false) => {
    if (isStartingRef.current || isCallActiveRef.current) return;
    isStartingRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      // Hold the stream in the ref immediately so the catch block can release
      // it if any later AudioContext setup step throws.
      streamRef.current = stream;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      timeDataRef.current = new Uint8Array(analyser.fftSize);
      waveRef.current = new Array(WAVE_POINTS).fill(0);

      setMicError("");
      setIsMuted(false);
      isMutedRef.current = false;
      setTranscriptIndex(0);
      isCallActiveRef.current = true;
      setIsCallActive(true);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(renderWave);
      isStartingRef.current = false;
    } catch (err) {
      isStartingRef.current = false;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      console.error("Mic error:", err);
      setMicError("Microphone access was blocked. Please allow mic access and try again.");
      // For header-triggered calls, fall back to a simulated active call so the
      // live-calling UI still shows the calling state even without mic access.
      if (allowSimulation) {
        isCallActiveRef.current = true;
        setIsCallActive(true);
        setTranscriptIndex(0);
      }
    }
  };

  // Start the call after the setup modal validates and confirms.
  const handleStartCall = () => {
    setIsSetupOpen(false);
    startCall();
  };

  // Keep the latest startCall implementation available to mount/event handlers.
  useEffect(() => {
    startCallRef.current = startCall;
  });

  // Consume a pending call that was started from the header's Start Call button.
  const consumePendingCall = useCallback(() => {
    if (typeof window === "undefined") return false;
    const raw = sessionStorage.getItem(PENDING_CALL_KEY);
    if (!raw) return false;
    try {
      const saved = JSON.parse(raw);
      sessionStorage.removeItem(PENDING_CALL_KEY);
      onSetupChange({ ...setup, ...saved });
      setIsSetupOpen(false);
      return true;
    } catch {
      return false;
    }
  }, [onSetupChange, setup]);

  // On mount: prefill + auto-start a call requested from the header, and keep
  // listening in case the header is clicked while already on this page.
  // State updates are deferred out of the effect body (React Compiler rule) —
  // booted stays false until then, so the setup modal never flashes.
  useEffect(() => {
    const id = setTimeout(() => {
      const started = consumePendingCall();
      setBooted(true);
      if (started) startCallRef.current?.(true);
    }, 0);

    const handleHeaderStart = () => {
      if (consumePendingCall()) startCallRef.current?.(true);
    };
    window.addEventListener(PENDING_CALL_EVENT, handleHeaderStart);
    return () => {
      clearTimeout(id);
      window.removeEventListener(PENDING_CALL_EVENT, handleHeaderStart);
    };
  }, [consumePendingCall]);

  const endCall = () => {
    stopAudio();
    waveRef.current = new Array(WAVE_POINTS).fill(0);
    if (wavePathRef.current) wavePathRef.current.setAttribute("d", "M 0,60 L 1000,60");
    speakingRef.current = false;
    setIsSpeaking(false);
    setIsMuted(false);
    isMutedRef.current = false;
    setTranscriptIndex(0);
    setIsCallActive(false);
    onCallEnded?.();
  };

  const toggleMute = () => {
    if (!isCallActive) return;
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next));
    }
  };

  const badge = !isCallActive
    ? { label: "Ready to start", cls: "bg-[#0b2830] text-[#00a884] border-[#00a884]/30", dot: "bg-[#00a884]" }
    : isMuted
      ? { label: "Muted", cls: "bg-[#2a1608] text-amber-400 border-amber-400/30", dot: "bg-amber-400" }
      : isSpeaking
        ? { label: "You're speaking", cls: "bg-[#0b2830] text-[#00a884] border-[#00a884]/30", dot: "bg-[#00a884]" }
        : { label: "Listening...", cls: "bg-[#0b2830] text-[#7dd3fc] border-[#7dd3fc]/30", dot: "bg-[#7dd3fc]" };

  const displayName = setup.leadName || "";
  const displayNumber = setup.phoneNumber || "";

  return (
    <div className="w-full font-sans text-[#1e293b]">
      {/* --- PRE-CALL SETUP MODAL (rendered above the live-calling section) --- */}
      <LiveCallingModal
        isOpen={booted && isSetupOpen && !isCallActive}
        onClose={() => setIsSetupOpen(false)}
        setup={setup}
        onSetupChange={onSetupChange}
        onStartCall={handleStartCall}
      />

      {/* --- DARK LIVE-CALL DISPLAY --- */}
      <div className="w-full bg-[#030d1a] rounded-2xl p-6 sm:p-8 text-white border border-slate-800/60 shadow-xl">
        <div className="relative flex flex-col items-center pt-2 pb-6 min-h-[580px] justify-between">
          {/* Top Header: Badge, Lead prompt, PitchProX Standard */}
          <div className="flex flex-col items-center gap-2 z-1 text-center">
            <div
              className={`text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 border transition-colors ${badge.cls}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.dot} ${isSpeaking ? "animate-pulse" : ""}`} />
              <span>{badge.label}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide mt-1">
              {displayName || (isCallActive ? "(310) 123-4567" : "Select a lead to begin")}
            </h3>

            <div className="flex items-center justify-center mt-0.5">
              <span className="text-[12px] font-medium text-slate-300 bg-[#0a1b2a] border border-slate-700/60 rounded-full px-3.5 py-1">
                {setup.playbook || setup.leadType || "PitchProX Standard"}
              </span>
            </div>

            {/* Disclosure notice: read this at the start of every call */}
            {isCallActive && (
              <div className="mt-3 max-w-md flex items-start gap-2.5 text-left bg-[#051824] border border-[#00a884]/40 rounded-xl px-3.5 py-2.5">
                <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed text-slate-200">
                  <span className="font-bold text-[#00a884] block">Disclosure</span>
                  &ldquo;Before we begin, this call uses an AI assistant to help me take notes.&rdquo; Read this at the start of the call. It&apos;s logged to the call record.
                </span>
              </div>
            )}
          </div>

          {/* Center Glowing Orb */}
          <div className="relative flex items-center justify-center my-6">
            {/* Top Soft Purple Radial Glow */}
            <div
              className={`absolute -top-10 w-64 h-44 bg-gradient-to-b from-purple-500/40 via-purple-700/20 to-transparent blur-3xl rounded-full pointer-events-none ${
                isSpeaking ? "animate-pulse" : ""
              }`}
            />

            {/* Orb Container */}
            <button
              type="button"
              onClick={!isCallActive ? () => setIsSetupOpen(true) : undefined}
              className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-[#8b5cf6] via-[#5b21b6] to-[#1e1b4b] shadow-[0_0_55px_rgba(139,92,246,0.3)] flex items-center justify-center overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] border border-purple-400/30"
              style={{
                transform: isSpeaking ? "scale(1.05)" : undefined,
              }}
            >
              {/* Inner highlight */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

              <span className="relative z-10 text-sm sm:text-base font-semibold text-white tracking-wide">
                {!isCallActive ? "Tap to start" : isMuted ? "Muted" : isSpeaking ? "Listening..." : "Analyzing..."}
              </span>
            </button>
          </div>

          {/* Live Microphone Waveform */}
          <div className="w-full max-w-2xl h-20 relative flex items-center justify-center my-2 overflow-visible">
            <svg
              className="w-full h-full text-[#00a884] overflow-visible"
              viewBox="0 0 1000 120"
              overflow="visible"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              {/* Real-time microphone curve */}
              <path
                ref={wavePathRef}
                d="M 0,60 L 1000,60"
                className="drop-shadow-[0_0_8px_rgba(0,168,132,0.45)]"
              />
              {/* Smooth static baseline curve */}
              <path
                d="M0,60 Q60,85 120,60 T240,60 T360,45 T480,75 T600,35 T720,75 T840,60 T1000,60"
                stroke="#00a884"
                strokeWidth="1.5"
                opacity="0.25"
              />
            </svg>
          </div>

          {/* Live Subtitle Transcript Text */}
          <div className="text-center max-w-2xl px-4 my-3">
            <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
              <span className="text-[#00a884] font-semibold">“</span>
              {TRANSCRIPT_LINES[transcriptIndex]}
              <span className="text-[#00a884] font-semibold">”</span>
            </p>
          </div>

          {/* Mic error notice */}
          {micError && (
            <div className="w-full max-w-md mt-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-medium px-4 py-2.5 rounded-xl text-center">
              {micError}
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="w-full mt-4 pt-2 px-2">
            {/* Desktop / Tablet View (sm and up) */}
            <div className="hidden sm:flex items-center justify-between gap-4">
              {/* Left: Call Quality */}
              <div className="bg-[#051824] border border-[#00a884]/40 rounded-2xl px-5 py-3.5 flex items-center justify-start gap-3 min-w-[170px] shadow-sm">
                <div className="flex items-end gap-1 h-5 text-[#00a884]">
                  <span className="w-1.5 h-2 bg-[#00a884] rounded-[2px]" />
                  <span className="w-1.5 h-3 bg-[#00a884] rounded-[2px]" />
                  <span className="w-1.5 h-4 bg-[#00a884] rounded-[2px]" />
                  <span className="w-1.5 h-5 bg-[#00a884] rounded-[2px]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Call Quality
                  </span>
                  <span className="text-sm font-bold text-[#00a884]">Excellent</span>
                </div>
              </div>

              {/* Center: Mic & Call Controller */}
              <div className="bg-[#00a884] p-1.5 rounded-full flex items-center gap-2 shadow-lg">
                {isCallActive && (
                  <button
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                    className="w-12 h-12 rounded-full bg-[#082a32] hover:bg-[#062026] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {isMuted ? <MicOff className="w-5 h-5 text-amber-400" /> : <Mic className="w-5 h-5 text-white" />}
                  </button>
                )}
                <button
                  onClick={isCallActive ? endCall : () => setIsSetupOpen(true)}
                  title={isCallActive ? "End call" : "Start call"}
                  className={`w-12 h-12 rounded-full text-white flex items-center justify-center transition-colors cursor-pointer ${
                    isCallActive ? "bg-[#ff4d4d] hover:bg-red-600" : "bg-[#062026] hover:bg-[#04161c]"
                  }`}
                >
                  {isCallActive ? <PhoneOff className="w-5 h-5 text-white" /> : <Phone className="w-5 h-5 text-[#00a884]" />}
                </button>
              </div>

              {/* Right: Trust Score */}
              <div className="bg-[#051824] border border-[#00a884]/40 rounded-2xl px-5 py-3.5 flex items-center justify-start gap-3 min-w-[170px] shadow-sm">
                <div className="text-red-500 shrink-0">
                  <svg className="w-6 h-6 fill-red-500/20 stroke-red-500" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.28" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Trust Score
                  </span>
                  <span className="text-sm font-bold text-[#00a884]">94%</span>
                </div>
              </div>
            </div>

            {/* Mobile View (< sm): Call Controller on TOP, Boxes BELOW */}
            <div className="flex sm:hidden flex-col items-center gap-3.5 w-full">
              {/* Tier 1 (TOP): Dedicated Call Action Controller Pill */}
              <div className="bg-[#00a884] p-1.5 rounded-full flex items-center gap-3 shadow-lg">
                {isCallActive && (
                  <button
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                    className="w-11 h-11 rounded-full bg-[#082a32] hover:bg-[#062026] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {isMuted ? <MicOff className="w-4.5 h-4.5 text-amber-400" /> : <Mic className="w-4.5 h-4.5 text-white" />}
                  </button>
                )}
                <button
                  onClick={isCallActive ? endCall : () => setIsSetupOpen(true)}
                  title={isCallActive ? "End call" : "Start call"}
                  className={`w-11 h-11 rounded-full text-white flex items-center justify-center transition-colors cursor-pointer ${
                    isCallActive ? "bg-[#ff4d4d] hover:bg-red-600" : "bg-[#062026] hover:bg-[#04161c]"
                  }`}
                >
                  {isCallActive ? <PhoneOff className="w-4.5 h-4.5 text-white" /> : <Phone className="w-4.5 h-4.5 text-[#00a884]" />}
                </button>
              </div>

              {/* Tier 2 (BELOW): Call Quality & Trust Score side-by-side */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <div className="bg-[#051824] border border-[#00a884]/40 rounded-xl p-3 flex items-center justify-center gap-2.5 shadow-sm">
                  <div className="flex items-end gap-0.5 h-4 text-[#00a884]">
                    <span className="w-1 h-1.5 bg-[#00a884] rounded-[1px]" />
                    <span className="w-1 h-2.5 bg-[#00a884] rounded-[1px]" />
                    <span className="w-1 h-3.5 bg-[#00a884] rounded-[1px]" />
                    <span className="w-1 h-4 bg-[#00a884] rounded-[1px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider leading-tight">
                      Call Quality
                    </span>
                    <span className="text-xs font-bold text-[#00a884]">Excellent</span>
                  </div>
                </div>

                <div className="bg-[#051824] border border-[#00a884]/40 rounded-xl p-3 flex items-center justify-center gap-2.5 shadow-sm">
                  <div className="text-red-500 shrink-0">
                    <svg className="w-4.5 h-4.5 fill-red-500/20 stroke-red-500" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.28" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider leading-tight">
                      Trust Score
                    </span>
                    <span className="text-xs font-bold text-[#00a884]">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM METRICS GRID CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        {/* Metric 1: AI Guidance */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">AI Guidance</span>
            <span className="text-[13px] font-bold text-primary">{isCallActive ? "Active" : "Idle"}</span>
          </div>
        </div>

        {/* Metric 2: Prompt Adherence */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">Prompt Adherence</span>
            <span className="text-[13px] font-bold text-purple-600">82%</span>
          </div>
        </div>

        {/* Metric 3: Objection Detected */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">Objection Detected</span>
            <span className="text-[13px] font-bold text-emerald-600">None</span>
          </div>
        </div>

        {/* Metric 4: Sentiment */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Smile className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">Sentiment</span>
            <span className="text-[13px] font-bold text-blue-600">{isSpeaking ? "Positive" : "Neutral"}</span>
          </div>
        </div>

        {/* Metric 5: Pacing */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">Pacing</span>
            <span className="text-[13px] font-bold text-primary">{isSpeaking ? "Optimal" : "Waiting"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartCall;

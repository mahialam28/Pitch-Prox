"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cpu,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Search,
  Smile,
  Sparkles,
  Square,
  Timer,
  ShieldCheck,
  Info,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import LiveCallingModal from "./live-calling-modal";
import Tooltip from "@/components/modals/tooltip";
import {
  PENDING_CALL_KEY,
  PENDING_CALL_EVENT,
} from "@/utils.js/call-constants";

const WAVE_POINTS = 72;

const TRANSCRIPT_LINES = [
  {
    highlight: "PitchProX provides",
    rest: "real-time speech guidance and objection handling live during your sales calls.",
  },
  {
    highlight: "Our AI teleprompter",
    rest: "dynamically adapts to prospect responses, keeping sales reps confident and on-script.",
  },
  {
    highlight: "We integrate seamlessly",
    rest: "with your existing CRM and VoIP dialers with zero workflow friction.",
  },
  {
    highlight: "How many reps",
    rest: "on your sales team currently handle outbound prospecting and live demos?",
  },
  {
    highlight: "Let's set up",
    rest: "a 15-minute live platform walkthrough next Tuesday morning to review potential ROI.",
  },
  {
    highlight: "Perfect, I'll send over",
    rest: "the calendar invitation along with our latest conversion case study.",
  },
];

export const StartCall = ({ onCallEnded, setup = {}, onSetupChange = () => { } }) => {
  const router = useRouter();
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

  const stopAudio = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    timeDataRef.current = null;
  }, []);

  useEffect(() => {
    if (!isCallActive) return;
    const id = setInterval(() => {
      setTranscriptIndex((i) => (i + 1) % TRANSCRIPT_LINES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [isCallActive]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

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
      raw[i] = muted ? 0 : (data[idx] - 128) / 128;
    }

    const prev = waveRef.current;
    const smoothed = new Array(n);
    for (let i = 0; i < n; i++) {
      smoothed[i] = prev[i] * 0.65 + raw[i] * 0.35;
    }
    waveRef.current = smoothed;

    const t = time / 1000;
    const idle = isCallActiveRef.current ? 0.04 : 0;

    const xStep = 1000 / (n - 1);
    let d = "";
    for (let i = 0; i < n; i++) {
      const ripple = idle * Math.sin(t * 2.4 + i * 0.45);
      const y = 60 - (smoothed[i] + ripple) * 55;
      d += `${i === 0 ? "M" : " L"} ${(i * xStep).toFixed(1)},${y.toFixed(1)}`;
    }
    if (wavePathRef.current) wavePathRef.current.setAttribute("d", d);

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
      if (allowSimulation) {
        isCallActiveRef.current = true;
        setIsCallActive(true);
        setTranscriptIndex(0);
      }
    }
  };

  const handleStartCall = () => {
    setIsSetupOpen(false);
    startCall();
  };

  useEffect(() => {
    startCallRef.current = startCall;
  });

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

  const handleConvertCustomer = () => {
    router.push("/internal-sales-representative/user-portal");
  };

  const badge = !isCallActive
    ? { label: "Ready to start", cls: "bg-[#052824]/60 text-[#00a884] border-[#00a884]/40", dot: "bg-[#00a884]" }
    : isMuted
      ? { label: "Muted", cls: "bg-[#2a1608] text-amber-400 border-amber-400/30", dot: "bg-amber-400" }
      : isSpeaking
        ? { label: "Prospect Speaking", cls: "bg-[#0b2830] text-[#7dd3fc] border-[#00a884]/30", dot: "bg-[#00a884]" }
        : { label: "Prospect Speaking", cls: "bg-[#0b2830] text-[#7dd3fc] border-[#00a884]/30", dot: "bg-[#7dd3fc]" };

  const displayName = setup.leadName || "";
  const displayNumber = setup.phoneNumber || "";

  return (
    <div className="w-full font-sans text-[#1e293b]">
      <LiveCallingModal
        isOpen={booted && isSetupOpen && !isCallActive}
        onClose={() => setIsSetupOpen(false)}
        setup={setup}
        onSetupChange={onSetupChange}
        onStartCall={handleStartCall}
      />

      {/* Main Dark Calling Console */}
      <div className="w-full bg-[#030d1a] rounded-2xl p-6 sm:p-8 text-white border border-slate-800/60 shadow-xl relative overflow-hidden">
        {/* Desktop Top Floating Cards (xl: and above) */}
        {isCallActive && (
          <>
            {/* Top Left: Disclosure Log */}
            <div className="hidden xl:flex absolute top-6 left-6 z-2">
              <div className="bg-[#051824] border border-[#00a884]/40 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-lg max-w-[250px]">
                <div className="w-7 h-7 rounded-lg bg-[#00a884]/15 text-[#00a884] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Disclosure Log
                    </span>
                    <span className="text-[9px] font-bold text-[#00a884] bg-[#00a884]/20 px-1 py-0.2 rounded">
                      Saved ✓
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Detected at <strong className="text-[#00a884] font-mono font-bold">00:12</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right: Trust Score */}
            <div className="hidden xl:flex absolute top-6 right-6 z-2">
              <div className="bg-[#051824] border border-[#00a884]/40 rounded-2xl px-4 sm:px-5 py-3 flex items-center gap-3 shadow-lg">
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
                  <span className="text-base font-bold text-[#00a884]">94%</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="relative flex flex-col items-center pt-2 pb-6 min-h-[580px] justify-between">
          {/* Top Center: Badge, Lead prompt, PitchProX Standard */}
          <div className="flex flex-col items-center gap-2 z-1 text-center w-full max-w-lg mx-auto">
            {/* Status Badges Row on Tablet / Mobile (< xl) */}
            {isCallActive && (
              <div className="flex xl:hidden items-center justify-center gap-2.5 flex-wrap mb-1">
                <div className="bg-[#051824] border border-[#00a884]/40 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
                  <span className="text-[10px] font-semibold text-slate-200">
                    Disclosure <strong className="text-[#00a884]">00:12</strong> (Saved ✓)
                  </span>
                </div>
                <div className="bg-[#051824] border border-[#00a884]/40 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xs">
                  <div className="text-red-500 shrink-0">
                    <svg className="w-3.5 h-3.5 fill-red-500/20 stroke-red-500" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.28" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Trust Score</span>
                  <span className="text-xs font-bold text-[#00a884]">94%</span>
                </div>
              </div>
            )}

            {/* Speaking Status Badge */}
            <div
              className={`text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 border transition-colors ${badge.cls}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.dot} ${isSpeaking ? "animate-pulse" : ""}`} />
              <span>{badge.label}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide mt-1">
              {displayName || (isCallActive ? (displayNumber || "(310) 123-4567") : "Select a lead to begin")}
            </h3>

            <div className="flex items-center justify-center mt-0.5">
              <span className="text-[12px] font-medium text-slate-300 bg-[#0a1b2a] border border-slate-700/60 rounded-full px-3.5 py-1">
                {setup.playbook || setup.leadType || "PitchProX Standard"}
              </span>
            </div>
          </div>

          {/* Central Animated Dialing Hub */}
          <div className="relative flex items-center justify-center my-3">
            <div
              className={`absolute -top-8 w-60 h-40 bg-gradient-to-b from-purple-500/35 via-purple-700/20 to-transparent blur-3xl rounded-full pointer-events-none ${isSpeaking ? "animate-pulse" : ""
                }`}
            />
            <button
              type="button"
              onClick={!isCallActive ? () => setIsSetupOpen(true) : undefined}
              className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-[#8b5cf6] via-[#5b21b6] to-[#1e1b4b] shadow-[0_0_45px_rgba(139,92,246,0.3)] flex items-center justify-center overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] border border-purple-400/30"
              style={{
                transform: isSpeaking ? "scale(1.05)" : undefined,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
              <span className="relative z-10 text-xs sm:text-sm font-semibold text-white tracking-wide">
                {!isCallActive ? "Tap to start" : isMuted ? "Muted" : isSpeaking ? "Listening..." : "Live Active"}
              </span>
            </button>
          </div>

          {/* Sound Waves */}
          <div className="w-full max-w-xl h-12 relative flex items-center justify-center my-1 overflow-visible">
            <svg
              className="w-full h-full text-[#00a884] overflow-visible"
              viewBox="0 0 1000 120"
              overflow="visible"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path
                ref={wavePathRef}
                d="M 0,60 L 1000,60"
                className="drop-shadow-[0_0_8px_rgba(0,168,132,0.45)]"
              />
              <path
                d="M0,60 Q60,85 120,60 T240,60 T360,45 T480,75 T600,35 T720,75 T840,60 T1000,60"
                stroke="#00a884"
                strokeWidth="1.5"
                opacity="0.25"
              />
            </svg>
          </div>

          {/* Real-time Spoken Transcript with Highlight */}
          <div className="text-center max-w-2xl px-4 my-3">
            <p className="text-sm sm:text-base md:text-lg font-medium text-slate-100 leading-relaxed">
              <span className="text-[#00e5be] font-semibold">“{TRANSCRIPT_LINES[transcriptIndex].highlight}</span>{" "}
              {TRANSCRIPT_LINES[transcriptIndex].rest}”
            </p>
          </div>

          {micError && (
            <div className="w-full max-w-md mt-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-medium px-4 py-2.5 rounded-xl text-center">
              {micError}
            </div>
          )}

          {/* Bottom Controls Bar */}
          {isCallActive ? (
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

                {/* Center: Mic & End Call Controller */}
                <div className="bg-[#00a884] p-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <button
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                    className="w-12 h-12 rounded-full bg-[#082a32] hover:bg-[#062026] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {isMuted ? <MicOff className="w-5 h-5 text-amber-400" /> : <Mic className="w-5 h-5 text-white" />}
                  </button>
                  <button
                    onClick={endCall}
                    title="End call"
                    className="w-12 h-12 rounded-full bg-[#ff4d4d] hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <PhoneOff className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Right: Convert The Customer Button */}
                <button
                  type="button"
                  onClick={handleConvertCustomer}
                  className="bg-[#051824] hover:bg-[#082a32] border border-[#00a884]/40 text-white font-medium text-xs sm:text-sm px-6 py-4 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm text-center flex items-center justify-center min-w-[170px]"
                >
                  Convert The Customer
                </button>
              </div>

              {/* Mobile View (< sm): Call Controller on TOP, Boxes BELOW */}
              <div className="flex sm:hidden flex-col items-center gap-3.5 w-full">
                {/* Tier 1 (TOP): Dedicated Call Action Controller Pill */}
                <div className="bg-[#00a884] p-1.5 rounded-full flex items-center gap-3 shadow-lg">
                  <button
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                    className="w-11 h-11 rounded-full bg-[#082a32] hover:bg-[#062026] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {isMuted ? <MicOff className="w-4.5 h-4.5 text-amber-400" /> : <Mic className="w-4.5 h-4.5 text-white" />}
                  </button>
                  <button
                    onClick={endCall}
                    title="End call"
                    className="w-11 h-11 rounded-full bg-[#ff4d4d] hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <PhoneOff className="w-4.5 h-4.5 text-white" />
                  </button>
                </div>

                {/* Tier 2 (BELOW): Call Quality & Convert The Customer side-by-side */}
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

                  <button
                    type="button"
                    onClick={handleConvertCustomer}
                    className="bg-[#051824] hover:bg-[#082a32] border border-[#00a884]/40 text-white font-medium text-xs p-3 rounded-xl transition-all duration-200 cursor-pointer shadow-sm text-center flex items-center justify-center"
                  >
                    Convert Customer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mt-4">
              <button
                onClick={() => setIsSetupOpen(true)}
                title="Start call"
                className="w-14 h-14 rounded-full border-2 border-[#00a884] bg-transparent flex items-center justify-center text-[#00a884] hover:bg-[#00a884]/15 hover:scale-105 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(0,168,132,0.35)]"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5 Bottom Insight Metric Cards with Modal Folder Tooltip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        {/* 1. AI Guidance */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">
                AI Guidance
              </span>
              <Tooltip
                text="Whether PitchProX real-time prompting is currently active."
                position="top"
                align="center"
                className="p-0 -m-0 hover:bg-transparent"
              >
                <Info className="w-3.5 h-3.5 text-light-black/50 hover:text-primary transition-colors cursor-pointer" />
              </Tooltip>
            </div>
            <span className="text-[13px] font-bold text-[#00a884]">
              {isCallActive ? "Active" : "Active"}
            </span>
          </div>
        </div>

        {/* 2. Prompt Adherence */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">
                Prompt Adherence
              </span>
              <Tooltip
                text="How closely the rep's delivery follows the strategic intent of the provided prompts."
                position="top"
                align="center"
                className="p-0 -m-0 hover:bg-transparent"
              >
                <Info className="w-3.5 h-3.5 text-light-black/50 hover:text-purple-600 transition-colors cursor-pointer" />
              </Tooltip>
            </div>
            <span className="text-[13px] font-bold text-purple-600">82%</span>
          </div>
        </div>

        {/* 3. Objection Detected */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">
                Objection Detected
              </span>
              <Tooltip
                text="The objection currently identified in the prospect's conversation."
                position="top"
                align="center"
                className="p-0 -m-0 hover:bg-transparent"
              >
                <Info className="w-3.5 h-3.5 text-light-black/50 hover:text-emerald-600 transition-colors cursor-pointer" />
              </Tooltip>
            </div>
            <span className="text-[13px] font-bold text-emerald-600">None</span>
          </div>
        </div>

        {/* 4. Sentiment */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Smile className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">
                Sentiment
              </span>
              <Tooltip
                text="The prospect's currently detected conversational sentiment."
                position="top"
                align="center"
                className="p-0 -m-0 hover:bg-transparent"
              >
                <Info className="w-3.5 h-3.5 text-light-black/50 hover:text-blue-600 transition-colors cursor-pointer" />
              </Tooltip>
            </div>
            <span className="text-[13px] font-bold text-blue-600">
              {isSpeaking ? "Positive" : "Positive"}
            </span>
          </div>
        </div>

        {/* 5. Pacing */}
        <div className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-light-gray shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center shrink-0">
            <Timer className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-dark-black uppercase tracking-wider">
                Pacing
              </span>
              <Tooltip
                text="Whether the rep's conversational pace is within the recommended range."
                position="top"
                align="center"
                className="p-0 -m-0 hover:bg-transparent"
              >
                <Info className="w-3.5 h-3.5 text-light-black/50 hover:text-primary transition-colors cursor-pointer" />
              </Tooltip>
            </div>
            <span className="text-[13px] font-bold text-[#00a884]">
              {isSpeaking ? "Optimal" : "Optimal"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartCall;


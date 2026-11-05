"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Volume2, Play, Pause } from "lucide-react";
import AlertModal from "@/components/modals/alert-modal";

const TOTAL_DURATION = 12; // seconds

const AudioPlayerCard = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(7);
  const [showError, setShowError] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  const stopAudio = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch { }
      oscillatorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => { });
      audioContextRef.current = null;
    }
  }, []);

  const startAudio = useCallback(() => {
    // Check if browser supports AudioContext
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      console.error("AudioContext not supported");
      setIsPlaying(false);
      setShowError(true);
      return;
    }

    try {
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const oscillator = ctx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4 note

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + TOTAL_DURATION);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime);

      oscillatorRef.current = oscillator;
      gainRef.current = gain;

      // Simulate playback timer
      startTimeRef.current = Date.now();
      setCurrentTime(0);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (elapsed >= TOTAL_DURATION) {
          setCurrentTime(TOTAL_DURATION);
          setIsPlaying(false);
          stopAudio();
        } else {
          setCurrentTime(elapsed);
        }
      }, 200);
    } catch (err) {
      console.error("Audio playback failed:", err);
      setIsPlaying(false);
      setShowError(true);
    }
  }, [stopAudio]);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      startAudio();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
        <div className="flex gap-3 sm:gap-4 items-start sm:items-center w-full sm:w-auto">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-light-teal text-primary flex items-center justify-center shrink-0">
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 flex-1 sm:flex-none">
            <h4 className="text-sm font-bold text-dark-black/80">AI (Lead)</h4>
            <p className="text-xs text-dark-black/80 mt-0.5 leading-relaxed">Hi, this is John. I saw a call from you. What&apos;s this regarding?</p>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 w-full sm:w-auto justify-end">
          <button
            onClick={togglePlay}
            disabled={isPlaying && currentTime >= TOTAL_DURATION}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-medium-teal text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 fill-white" />
            ) : (
              <Play className="h-3 w-3 fill-white" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <span className="text-[10px] text-light-black font-medium whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
          </span>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-center justify-center gap-[2px] sm:gap-[3px] h-10 sm:h-12 pt-2 px-2 sm:px-4 overflow-hidden">
        {Array.from({ length: 65 }).map((_, i) => {
          const heights = [12, 24, 36, 16, 8, 44, 28, 20, 48, 14, 32, 40, 10];
          const h = heights[i % heights.length];
          return (
            <span
              key={i}
              className={`w-[3px] rounded-full inline-block transition-all duration-300 ${isPlaying ? "bg-primary" : "bg-primary/70"
                }`}
              style={{ height: `${isPlaying ? h + 10 : h}px` }}
            />
          );
        })}
      </div>

      {/* Error Alert */}
      <AlertModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        type="error"
        title="Playback Error"
        message="Unable to play audio. Please check your browser permissions and try again."
      />
    </div>
  );
};

export default AudioPlayerCard;
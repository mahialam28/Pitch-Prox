"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Loader2, Circle } from "lucide-react";
import AlertModal from "@/components/modals/alert-modal";

const RecorderCard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [showMicError, setShowMicError] = useState(false);
  const [micErrorTitle, setMicErrorTitle] = useState("");
  const [micErrorMessage, setMicErrorMessage] = useState("");
  const [lastRecordingUrl, setLastRecordingUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const lastRecordingUrlRef = useRef(null);

  const cleanupMedia = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    setIsRequestingMic(true);

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsRequestingMic(false);
      setMicErrorTitle("Browser Not Supported");
      setMicErrorMessage("Your browser does not support microphone access. Please try using the latest version of Chrome, Edge, or Firefox.");
      setShowMicError(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        if (lastRecordingUrlRef.current) {
          URL.revokeObjectURL(lastRecordingUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        lastRecordingUrlRef.current = url;
        setLastRecordingUrl(url);
        setIsRecording(false);
        cleanupMedia();
      };

      mediaRecorder.start(250);

      startTimeRef.current = Date.now();
      setRecordedDuration(0);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordedDuration(elapsed);
      }, 200);

      setIsRecording(true);
      setIsRequestingMic(false);
    } catch (err) {
      setIsRequestingMic(false);
      if (err.name === "NotAllowedError") {
        setMicErrorTitle("Permission Denied");
        setMicErrorMessage("Microphone access was denied. Please allow microphone permissions in your browser settings and try again.");
      } else if (err.name === "NotFoundError") {
        setMicErrorTitle("No Microphone Found");
        setMicErrorMessage("No microphone was detected on your device. Please connect a microphone and try again.");
      } else {
        setMicErrorTitle("Recording Error");
        setMicErrorMessage("Unable to access microphone. Please check your device and browser permissions.");
      }
      setShowMicError(true);
      console.error("Recording error:", err);
    }
  }, [cleanupMedia]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (lastRecordingUrlRef.current) {
        URL.revokeObjectURL(lastRecordingUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full bg-white border border-light-gray rounded-2xl p-4 sm:p-8 shadow-sm min-h-[200px] sm:min-h-[260px] flex flex-col items-center justify-center gap-4 sm:gap-6">
      {/* Status text row */}
      <div className="flex items-center gap-2">
        {!isRecording && !isRequestingMic && !lastRecordingUrl && (
          <Circle className="h-2 w-2 text-primary animate-pulse" />
        )}
        <span className="text-xs font-semibold text-medium-black">
          {isRequestingMic
            ? "Requesting microphone..."
            : isRecording
            ? `Recording... ${formatDuration(recordedDuration)}`
            : lastRecordingUrl
            ? "Recording complete"
            : "Tap the mic to speak your response"}
        </span>
      </div>



      <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-md">
        <div className="flex-1 flex items-center justify-end gap-[2px] sm:gap-[3px] h-8 sm:h-10 overflow-hidden">
          {[16, 28, 12, 36, 20, 44, 14, 32, 8, 24, 40].map((h, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-all duration-300 ${
                isRecording ? "bg-primary" : "bg-primary/60"
              }`}
              style={{ height: `${isRecording ? h * 1.5 : h}px` }}
            />
          ))}
        </div>

        <button
          onClick={toggleRecording}
          disabled={isRequestingMic}
          className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center shadow-md transition-all duration-300 shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
            isRecording
              ? "bg-red text-white animate-pulse scale-110"
              : "bg-primary text-white hover:bg-medium-teal active:scale-95"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRequestingMic ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isRecording ? (
            <Square className="h-6 w-6 fill-white" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>

        <div className="flex-1 flex items-center justify-start gap-[2px] sm:gap-[3px] h-8 sm:h-10 overflow-hidden">
          {[40, 24, 8, 32, 14, 44, 20, 36, 12, 28, 16].map((h, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-all duration-300 ${
                isRecording ? "bg-primary" : "bg-primary/60"
              }`}
              style={{ height: `${isRecording ? h * 1.5 : h}px` }}
            />
          ))}
        </div>
      </div>



      <AlertModal
        isOpen={showMicError}
        onClose={() => setShowMicError(false)}
        type="error"
        title={micErrorTitle}
        message={micErrorMessage}
      />
    </div>
  );
};

export default RecorderCard;

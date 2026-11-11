"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/client-api";

// One live (or practice) call: starts it through the app, then talks to the call service over a
// WebSocket. Everything shown on the screen (transcript, the line to say, status, metrics) comes
// from the AI Core in the call service.
//
// phase: idle | connecting | active | ending | ended | error

const EMPTY = { phase: "idle", call: null, opener: null, prompt: null, turns: [], status: "idle", metrics: null, error: "", summary: null, disclosureLogged: false };
const MAX_TURNS = 200;

export function useLiveCall() {
  const [state, setState] = useState(EMPTY);
  const socketRef = useRef(null);
  const pingRef = useRef(null);
  const endedRef = useRef(false);

  const patch = useCallback((next) => setState((current) => ({ ...current, ...(typeof next === "function" ? next(current) : next) })), []);

  const cleanup = useCallback(() => {
    clearInterval(pingRef.current);
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket && socket.readyState <= 1) socket.close();
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const send = useCallback((message) => {
    const socket = socketRef.current;
    if (socket?.readyState === 1) socket.send(JSON.stringify(message));
  }, []);

  const handleMessage = useCallback(
    (message) => {
      switch (message.type) {
        case "ready":
          patch({ phase: "active", call: message.call, opener: message.opener, metrics: message.metrics, status: "listening" });
          break;
        case "turn":
          patch((s) => ({ turns: [...s.turns, message.turn].slice(-MAX_TURNS), opener: message.turn.speaker === "rep" ? null : s.opener, prompt: message.turn.speaker === "rep" ? null : s.prompt }));
          break;
        case "prompt":
          patch({ prompt: message.prompt });
          break;
        case "prompt_cancelled":
          patch((s) => ({ prompt: s.prompt?.id === message.id ? null : s.prompt }));
          break;
        case "status":
          patch({ status: message.status });
          break;
        case "metrics":
          patch((s) => ({ metrics: message.metrics, disclosureLogged: s.disclosureLogged || Boolean(message.metrics?.disclosureGiven) }));
          break;
        case "ended":
          endedRef.current = true;
          patch({ phase: "ended", summary: message.summary ?? null, prompt: null, status: "ended" });
          cleanup();
          break;
        case "error":
          patch({ error: message.message });
          break;
        default:
          break;
      }
    },
    [patch, cleanup]
  );

  // setup: { mode: "practice"|"live", scriptId?, roleplay?, contactKind?, contactId?, phoneId?, leadName?, phoneNumber?, leadType? }
  const start = useCallback(
    async (setup) => {
      cleanup();
      endedRef.current = false;
      setState({ ...EMPTY, phase: "connecting", status: "connecting" });
      let started;
      try {
        started = await apiRequest("/api/v1/calls", { method: "POST", body: setup });
      } catch (error) {
        setState({ ...EMPTY, phase: "error", error: error.message || "The call couldn't start." });
        return false;
      }
      const socket = new WebSocket(`${started.serviceUrl.replace(/\/$/, "")}/?token=${encodeURIComponent(started.token)}`);
      socketRef.current = socket;
      patch({ call: started.call });
      socket.onmessage = (event) => {
        try {
          handleMessage(JSON.parse(event.data));
        } catch {
          /* ignore malformed messages */
        }
      };
      socket.onclose = (event) => {
        clearInterval(pingRef.current);
        if (endedRef.current) return;
        patch((s) => (s.phase === "ended" ? {} : { phase: "error", status: "ended", prompt: null, error: event.code === 4401 ? "The call link expired. Start the call again." : event.code === 4409 ? "This call is already open in another window." : "The connection to the call service was lost." }));
      };
      socket.onerror = () => {
        patch((s) => (s.phase === "connecting" ? { phase: "error", status: "ended", error: "Couldn't reach the call service. Is it running?" } : {}));
      };
      pingRef.current = setInterval(() => send({ type: "ping" }), 25_000);
      return true;
    },
    [cleanup, handleMessage, patch, send]
  );

  const say = useCallback((text) => {
    const value = String(text ?? "").trim();
    if (value) send({ type: "rep_said", text: value });
  }, [send]);
  const prospectSay = useCallback((text) => {
    const value = String(text ?? "").trim();
    if (value) send({ type: "prospect_said", text: value });
  }, [send]);
  const markDisclosure = useCallback(() => {
    send({ type: "disclosure_read" });
    patch({ disclosureLogged: true });
  }, [send, patch]);
  const setAiPaused = useCallback((paused) => send({ type: paused ? "stop_ai" : "resume_ai" }), [send]);
  const end = useCallback(() => {
    if (socketRef.current?.readyState === 1) {
      patch({ phase: "ending", status: "ending" });
      send({ type: "end" });
    } else {
      cleanup();
      patch({ phase: "ended", status: "ended" });
    }
  }, [send, patch, cleanup]);
  const reset = useCallback(() => {
    cleanup();
    setState(EMPTY);
  }, [cleanup]);

  return { ...state, start, say, prospectSay, markDisclosure, setAiPaused, end, reset };
}

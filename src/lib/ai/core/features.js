// Behavioral features from timestamped, speaker-separated transcript events (Spec 07).
// Keeps rolling aggregates per speaker instead of re-reading the whole call on every word, and a
// per-speaker baseline so a naturally slow talker isn't read as disengaged (Spec 07 §5, Spec 08 §11).
// Text-only input never produces acoustic/tone features (Spec 07 §1, Spec 10 §11).

import { clamp, round, wordCount } from "./text.js";

const BASELINE_MIN_WORDS = 35;
const BASELINE_MIN_TURNS = 2;
const WINDOWS = { short: 10_000, medium: 30_000, long: 90_000 };

const emptySpeaker = () => ({ turns: 0, words: 0, voicedMs: 0, baseline: null, turnWords: [], history: [] });

export function createFeatureEngine() {
  const speakers = { prospect: emptySpeaker(), rep: emptySpeaker(), unknown: emptySpeaker() };
  const turns = []; // { speaker, start, end, words }

  // Voiced time: from word timestamps when present, else the utterance span
  function voicedMsOf(event) {
    const list = Array.isArray(event.words) ? event.words : [];
    if (list.length) return list.reduce((sum, w) => sum + Math.max(0, (w.end_ms ?? 0) - (w.start_ms ?? 0)), 0) || Math.max(1, event.utterance_end_ms - event.utterance_start_ms);
    return Math.max(1, (event.utterance_end_ms ?? 0) - (event.utterance_start_ms ?? 0));
  }

  function pauseRatioOf(event) {
    const list = Array.isArray(event.words) ? event.words : [];
    const span = (event.utterance_end_ms ?? 0) - (event.utterance_start_ms ?? 0);
    if (list.length < 2 || span <= 0) return null;
    let gaps = 0;
    for (let i = 1; i < list.length; i += 1) gaps += Math.max(0, (list[i].start_ms ?? 0) - (list[i - 1].end_ms ?? 0));
    return clamp(gaps / span, 0, 1);
  }

  function windowStats(speaker, now, span) {
    const recent = turns.filter((t) => t.speaker === speaker && t.end >= now - span);
    const words = recent.reduce((sum, t) => sum + t.words, 0);
    const voiced = recent.reduce((sum, t) => sum + t.voiced, 0);
    return {
      turns: recent.length,
      words,
      wpm: voiced > 0 ? round((words / voiced) * 60_000) : null,
      interruptions: recent.filter((t) => t.interrupted).length,
    };
  }

  // Returns the feature object for this utterance (Spec 07 §7)
  function update(event) {
    const speaker = speakers[event.speaker] ? event.speaker : "unknown";
    const data = speakers[speaker];
    const count = event.words?.length ? event.words.length : wordCount(event.utterance_text);
    const voiced = voicedMsOf(event);
    const wpm = count > 0 ? round((count / voiced) * 60_000) : 0;

    const previous = [...turns].reverse().find((t) => t.speaker !== speaker && t.speaker !== "unknown");
    const latency = previous ? event.utterance_start_ms - previous.end : null;
    const interrupted = latency !== null && latency < -200; // started while the other was still talking

    turns.push({ speaker, start: event.utterance_start_ms, end: event.utterance_end_ms, words: count, voiced, interrupted, other: previous?.speaker ?? null });

    data.turns += 1;
    data.words += count;
    data.voicedMs += voiced;
    data.turnWords.push(count);
    data.history.push({ wpm, words: count, at: event.utterance_end_ms });
    if (!data.baseline && data.turns >= BASELINE_MIN_TURNS && data.words >= BASELINE_MIN_WORDS) {
      data.baseline = { wpm: round((data.words / data.voicedMs) * 60_000), turn_words: round(data.words / data.turns, 1), established_at_ms: event.utterance_end_ms };
    }

    const baseline = data.baseline;
    const deltaPct = baseline && wpm ? round(((wpm - baseline.wpm) / baseline.wpm) * 100, 1) : null;
    const depthVsBaseline = baseline ? round(count / Math.max(1, baseline.turn_words), 2) : null;
    const now = event.utterance_end_ms;
    const asr = typeof event.asr_confidence === "number" ? event.asr_confidence : 0.85;
    const timestamps = Number.isFinite(event.utterance_start_ms) && Number.isFinite(event.utterance_end_ms) && event.utterance_end_ms > event.utterance_start_ms;
    const speakerKnown = speaker !== "unknown";

    return {
      window_start_ms: event.utterance_start_ms,
      window_end_ms: event.utterance_end_ms,
      speaker_id: speaker,
      turn_index: data.turns,
      speech_rate_wpm: wpm,
      speech_rate_delta_pct: deltaPct,
      response_latency_ms: latency,
      interrupted,
      pause_ratio: pauseRatioOf(event),
      turn_length_words: count,
      turn_depth_vs_baseline: depthVsBaseline,
      baseline_ready: Boolean(baseline),
      windows: {
        short: windowStats(speaker, now, WINDOWS.short),
        medium: windowStats(speaker, now, WINDOWS.medium),
        long: windowStats(speaker, now, WINDOWS.long),
        other_long: previous ? windowStats(previous.speaker, now, WINDOWS.long) : null,
      },
      acoustic: null, // only from an audio feature provider; never inferred from text
      feature_confidence: round(clamp(asr * (timestamps ? 1 : 0.6) * (speakerKnown ? 1 : 0.5), 0, 1), 2),
    };
  }

  const baselineOf = (speaker) => speakers[speaker]?.baseline ?? null;
  const rateOf = (speaker) => {
    const data = speakers[speaker];
    return data?.voicedMs ? round((data.words / data.voicedMs) * 60_000) : null;
  };
  const turnsOf = (speaker) => turns.filter((t) => t.speaker === speaker);
  return { update, baselineOf, rateOf, turnsOf, get turns() { return turns; } };
}

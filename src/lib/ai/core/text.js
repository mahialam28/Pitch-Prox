// Small text helpers shared by the Core (no app imports, so the call service and tests can use them).

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const normalize = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

export const words = (text) => normalize(text).match(/[a-z0-9$%']+/g) ?? [];
export const wordCount = (text) => words(text).length;

const STOP_WORDS = new Set(
  "a an the and or but so to of in on at for with from by is are was were be been it its it's this that these those i you we they he she me my your our their his her them us do does did have has had just really very can could would should will i'm you're we're they're im not no yes ok okay well um uh like".split(" ")
);
export const contentWords = (text) => words(text).filter((word) => !STOP_WORDS.has(word) && word.length > 2);

// Jaccard overlap of content words (0–1)
export function overlap(a, b) {
  const left = new Set(contentWords(a));
  const right = new Set(contentWords(b));
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  return shared / (left.size + right.size - shared);
}

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const phraseCache = new Map();
// A string pattern matches as a whole word/phrase ("fee" doesn't match "feel"); a RegExp is used as is
function toRegExp(pattern) {
  if (pattern instanceof RegExp) return pattern;
  if (!phraseCache.has(pattern)) phraseCache.set(pattern, new RegExp(`(^|[^a-z0-9'])${escape(pattern)}(?=$|[^a-z0-9'])`));
  return phraseCache.get(pattern);
}

export const matchesAny = (text, patterns) => {
  const value = normalize(text);
  return patterns.some((pattern) => toRegExp(pattern).test(value));
};

export const countMatches = (text, patterns) => {
  const value = normalize(text);
  return patterns.filter((pattern) => toRegExp(pattern).test(value)).length;
};

// Rejects after `ms` even if the underlying call never settles (providers can ignore their own timeouts)
export function withDeadline(promise, ms, label = "deadline") {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`${label} exceeded ${ms} ms`);
        error.name = "AbortError";
        reject(error);
      }, ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

let counter = 0;
export const makeId = (prefix) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36).padStart(3, "0")}`;

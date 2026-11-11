// AI Training retrieval (Spec 02, Spec 11 §8). A knowledge service, not the brain: it only runs
// when the Core asks for facts, returns only what this user may see, and never settles a fact two
// sources disagree on. AI-1 ranks by word overlap; AI-5 adds embeddings behind the same interface.

import { overlap, contentWords } from "./text.js";

const AUTHORITY = { system_validated: 3, company_approved: 2, user_supplied: 1 };
const MIN_RELEVANCE = 0.08;

const visibleTo = (item, scope) => {
  if (item.deleted) return false;
  if (item.owner_scope === "user") return item.owner_id === scope.user_id;
  if (item.owner_scope === "team" || item.owner_scope === "company" || item.owner_scope === "brokerage") return item.organization_id === scope.organization_id;
  return false;
};
const effective = (item, now) => (!item.effective_from || new Date(item.effective_from) <= now) && (!item.effective_to || new Date(item.effective_to) >= now);
const isProof = (item) => ["performance", "past_sales", "case_study"].includes(item.knowledge_class);
export const isVerified = (item) => item.verification_status === "company_approved" || item.verification_status === "system_validated";

// Is there at least one verified proof point this user may use? (decides whether social proof is allowed)
export function hasVerifiedProof(knowledge = [], scope = {}, now = new Date()) {
  return knowledge.some((item) => visibleTo(item, scope) && effective(item, now) && isProof(item) && isVerified(item));
}

export function retrieve(knowledge = [], { question = "", topic = null, scope = {}, now = new Date(), limit = 3 } = {}) {
  const terms = contentWords(question);
  const candidates = knowledge
    .filter((item) => visibleTo(item, scope) && effective(item, now))
    .map((item) => {
      const text = `${item.source_title ?? ""} ${(item.topic_tags ?? []).join(" ")} ${item.text}`;
      let relevance = overlap(question, text) + (topic && (item.topic_tags ?? []).includes(topic) ? 0.1 : 0);
      if (terms.some((t) => (item.topic_tags ?? []).includes(t))) relevance += 0.08;
      // Unverified performance claims are never presented as fact (Spec 02 §8–9)
      if (isProof(item) && !isVerified(item)) relevance = 0;
      return { item, relevance };
    })
    .filter((entry) => entry.relevance >= MIN_RELEVANCE)
    .sort((a, b) => b.relevance - a.relevance || (AUTHORITY[b.item.verification_status] ?? 0) - (AUTHORITY[a.item.verification_status] ?? 0) || String(b.item.uploaded_at ?? "").localeCompare(String(a.item.uploaded_at ?? "")));

  // Conflicts: two sources state different values for the same fact
  const byFact = new Map();
  for (const entry of candidates) {
    if (!entry.item.fact_key) continue;
    if (!byFact.has(entry.item.fact_key)) byFact.set(entry.item.fact_key, []);
    byFact.get(entry.item.fact_key).push(entry.item);
  }
  const conflicts = [];
  const suppressed = new Set();
  for (const [key, items] of byFact) {
    const values = new Set(items.map((i) => String(i.value ?? i.text)));
    if (values.size < 2) continue;
    const ranked = [...items].sort((a, b) => (AUTHORITY[b.verification_status] ?? 0) - (AUTHORITY[a.verification_status] ?? 0) || String(b.effective_from ?? b.uploaded_at ?? "").localeCompare(String(a.effective_from ?? a.uploaded_at ?? "")));
    const top = ranked[0];
    const tie = ranked.filter((i) => (AUTHORITY[i.verification_status] ?? 0) === (AUTHORITY[top.verification_status] ?? 0) && String(i.effective_from ?? i.uploaded_at ?? "") === String(top.effective_from ?? top.uploaded_at ?? ""));
    if (tie.length > 1) {
      conflicts.push({ fact_key: key, sources: items.map((i) => i.knowledge_id), resolution: "unresolved_do_not_assert" });
      items.forEach((i) => suppressed.add(i.knowledge_id));
    } else {
      conflicts.push({ fact_key: key, sources: items.map((i) => i.knowledge_id), resolution: `prefer_${top.knowledge_id}` });
      items.filter((i) => i !== top).forEach((i) => suppressed.add(i.knowledge_id));
    }
  }

  const facts = candidates
    .filter((entry) => !suppressed.has(entry.item.knowledge_id))
    .slice(0, limit)
    .map(({ item, relevance }) => ({ source_id: item.knowledge_id, source_title: item.source_title, scope: item.owner_scope, knowledge_class: item.knowledge_class, verification_status: item.verification_status, version: item.source_version ?? null, relevance: Math.round(relevance * 100) / 100, text: item.text }));
  return { facts, conflicts };
}

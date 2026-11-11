// ── Published playbooks: what customers see and what the AI gets (Spec 12 §6.1, §11) ──
// Pure functions over a compiled PremiumPlaybook object (lib/playbook-compile.js).

const list = (value) => (Array.isArray(value) ? value : []);

// The AI-safe export: everything the live-call AI may use. Commercial metadata (price, access,
// distribution, cover art, assets, marketplace description), internal notes and internal tags are
// removed, because they must never steer live strategy.
export function aiPlaybook(compiled) {
  if (!compiled) return null;
  const { commerce, internal, identity = {}, publication = {}, ...rest } = compiled;
  const { description, internal_tags, status, ...identityForAi } = identity;
  return {
    contract: "pitchprox.premium-playbook/1",
    identity: identityForAi,
    ...rest,
    resources: list(rest.resources).map(aiResource),
    publication: { version: publication.version ?? identity.version ?? null, published_at: publication.published_at ?? null, based_on_version: publication.based_on_version ?? null },
  };
}

// Email Templates and Follow-Up resources are used after the call only (client's Google Doc):
// never on the teleprompter, and the live AI never gets a template's full text. It only learns
// which follow-ups the playbook offers, so it can suggest one.
function aiResource(resource) {
  if (resource?.type === "Email Template") {
    const { content, subject, file, url, fileUrl, ...meta } = resource;
    return { ...meta, use: "after_call", live_prompt: false };
  }
  if (resource?.type === "Follow Up") return { ...resource, use: "after_call", live_prompt: false };
  return { ...resource, use: "live" };
}

// The marketplace card / details window: facts from the published version (no internals)
export function playbookOverview(compiled) {
  if (!compiled) return null;
  const identity = compiled.identity ?? {};
  const voice = compiled.voice_language ?? {};
  return {
    version: identity.version ?? null,
    category: identity.category,
    industry: identity.industry,
    experienceLevel: identity.experience_level,
    style: identity.style,
    bestFor: list(identity.best_for_lead_types),
    focusAreas: list(identity.focus_areas),
    keyOutcomes: list(identity.key_outcomes),
    tones: list(voice.tones),
    counts: {
      stages: list(compiled.conversation_flow).length,
      objections: list(compiled.objection_library).length,
      resources: list(compiled.resources).length,
      rules: list(compiled.logic_rules?.rules).length,
    },
    publishedAt: compiled.publication?.published_at ?? null,
  };
}

// Read-only methodology for people who have the playbook (buyers, staff, free playbooks)
export function playbookInside(compiled) {
  if (!compiled) return null;
  return {
    stages: list(compiled.conversation_flow).map((stage) => ({ title: stage.title, description: stage.description ?? null, goal: stage.goal ?? null })),
    objections: list(compiled.objection_library).map((objection) => ({ phrase: objection.phrase, rootCategory: objection.root_category, subtype: objection.subtype, responseStyle: objection.preferred_response_style, goal: objection.goal })),
    resources: list(compiled.resources).map((resource) => ({ name: resource.name ?? resource.title, type: resource.type, description: resource.description ?? null, content: resource.content ?? null })),
    principles: list(compiled.methodology?.selling_principles),
    phrases: list(compiled.voice_language?.unique_phrases),
    wordsToAvoid: list(compiled.voice_language?.words_to_avoid),
  };
}

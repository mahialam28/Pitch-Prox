// ── Premium Playbook compilation and publish checks (Spec 12 §5, §6.4, §9) ──
// Pure functions (no database): the server enforces them when publishing, and the builder's
// Review & Publish step shows the same results. compilePlaybook() turns the builder form into the
// canonical PremiumPlaybook object; checkPlaybook() returns blocking errors and warnings that a
// reviewer must acknowledge (§9.1 contradictions, near-duplicates).

import { TEMPLATE_PLACEHOLDERS, TEMPLATE_PURPOSES } from "../utils.js/follow-up.js";

// §6.4: the only root categories; anything more specific is a subtype
export const OBJECTION_ROOTS = ["Financial", "Risk", "Logistics", "Relationship"];
export const OBJECTION_SUBTYPES = ["Affordability", "Value uncertainty", "Timing", "Decision coordination", "Loyalty", "Trust damage", "Privacy concern", "Identity cost / emotional", "Information needed", "Competition"];
// Older builder labels → root + subtype
const LEGACY = {
  Pricing: ["Financial", "Affordability"],
  Timing: ["Logistics", "Timing"],
  Competition: ["Relationship", "Competition"],
  Privacy: ["Risk", "Privacy concern"],
  Disinterest: ["Relationship", "Identity cost / emotional"],
  Information: ["Logistics", "Information needed"],
  Authority: ["Logistics", "Decision coordination"],
  "Identity / Emotional": ["Relationship", "Identity cost / emotional"],
};

// One objection in the canonical shape: one root, a subtype, stages and lead types as lists
export function normalizeObjection(objection) {
  const raw = objection.rootCategory ?? objection.category ?? objection.categories?.[0] ?? "";
  const legacy = LEGACY[raw];
  const root = OBJECTION_ROOTS.includes(raw) ? raw : legacy?.[0] ?? null;
  const fromSecond = objection.categories?.[1] ? LEGACY[objection.categories[1]]?.[1] ?? objection.categories[1] : null;
  const subtype = String(objection.subtype ?? "").trim() || legacy?.[1] || fromSecond || null;
  return {
    ...objection,
    category: root,
    rootCategory: root,
    subtype,
    categories: undefined,
    stages: objection.stages ?? (objection.stage ? [objection.stage] : []),
    leadTypes: Array.isArray(objection.leadTypes) ? objection.leadTypes.filter((type) => !/^\+\d+$/.test(type)) : [],
  };
}

const ACCESS_TYPES = ["premium", "free"];
const DISTRIBUTIONS = ["one-time", "subscription"];
export const VISIBILITIES = { private: "Private — creator only", team: "Team Only — internal staff team", organization: "Organization — whole company / brokerage", marketplace: "Marketplace / Published — approved PitchProX playbooks" };
export const visibilityKey = (value) => Object.keys(VISIBILITIES).find((key) => key === value || VISIBILITIES[key] === value) ?? null;

// Builder steps, for messages and "jump to" links
export const SECTIONS = { 1: "Basic Info", 2: "Style & Voice", 3: "Conversation Flow", 4: "Objection Handling", 5: "Resources & Scripts", 6: "AI Prompt Framework", 7: "Review & Publish" };

const text = (value) => String(value ?? "").trim();
const list = (value) => (Array.isArray(value) ? value : []);
const words = (value) => {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : null;
};
const blob = (value) => JSON.stringify(value ?? "").toLowerCase();
const dupes = (items) => {
  const seen = new Map();
  const repeated = new Set();
  for (const item of items.map((value) => text(value).toLowerCase()).filter(Boolean)) {
    if (seen.has(item)) repeated.add(item);
    seen.set(item, true);
  }
  return [...repeated];
};

// ── Checks ──
export function checkPlaybook(form = {}) {
  const errors = [];
  const warnings = [];
  const error = (step, message) => errors.push({ step, section: SECTIONS[step], message });
  const warn = (step, message, kind = "review") => warnings.push({ step, section: SECTIONS[step], message, kind });
  const ai = form.aiFramework ?? {};

  // Step 1: identity and commerce
  const name = text(form.playbookName);
  if (!name) error(1, "Give the playbook a name.");
  else if (name.length < 3 || name.length > 80) error(1, "The playbook name must be 3–80 characters.");
  const description = text(form.shortDescription);
  if (!description) error(1, "Write a short description.");
  else if (description.length > 300) error(1, "The short description is too long (300 characters max).");
  if (!text(form.author)) error(1, "Add the author / creator.");
  for (const [key, label] of [["category", "category"], ["industry", "industry"], ["experienceLevel", "experience level"], ["style", "selling style"]]) {
    if (!text(form[key])) error(1, `Choose the ${label}.`);
  }
  if (!list(form.leadTypes).length) error(1, "Choose at least one lead type this playbook is best for.");
  if (!ACCESS_TYPES.includes(form.accessType ?? "premium")) error(1, "Access type must be Premium or Free.");
  if (!DISTRIBUTIONS.includes(form.distribution ?? "one-time")) error(1, "Distribution must be One-time Purchase or Subscription.");
  if ((form.accessType ?? "premium") === "premium") {
    const price = Number.parseFloat(form.price);
    if (!Number.isFinite(price) || price <= 0) error(1, "A premium playbook needs a price above $0.");
    else if (price > 10000) error(1, "The price looks wrong (over $10,000).");
  }
  if (form.visibility && !visibilityKey(form.visibility)) error(7, "Choose who can see the playbook.");
  if (text(form.internalNotes).length > 2000) error(1, "Internal notes are too long (2,000 characters max).");

  // Step 2: style and voice
  if (!list(form.tones).length) error(2, "Choose at least one overall tone.");
  if (list(form.tones).length > 3) error(2, "Choose at most 3 overall tones.");
  for (const [key, label] of [["energyLevel", "Energy level"], ["useOfHumor", "Use of humor"]]) {
    const value = Number(form[key]);
    if (form[key] !== undefined && (!Number.isFinite(value) || value < 0 || value > 100)) error(2, `${label} must be between 0 and 100.`);
  }
  const avoid = list(form.wordsToAvoid).map((word) => text(word).toLowerCase());
  const clash = list(form.voicePhrases).filter((phrase) => avoid.some((word) => word && text(phrase).toLowerCase().includes(word)));
  if (clash.length) warn(2, `Unique voice phrases use words from "Words to avoid": ${clash.slice(0, 3).join(", ")}.`, "contradiction");

  // Step 3: conversation flow
  const stages = list(form.stages);
  if (stages.length < 3) error(3, "Add at least 3 conversation stages.");
  if (stages.some((stage) => !text(stage.title))) error(3, "Every conversation stage needs a title.");
  const stageDupes = dupes(stages.map((stage) => stage.title));
  if (stageDupes.length) error(3, `Stage names are repeated: ${stageDupes.join(", ")}.`);

  // Step 4: objections (§6.4)
  const objections = list(form.objections).map(normalizeObjection);
  if (!objections.length) error(4, "Add at least one objection.");
  objections.forEach((objection, index) => {
    const label = text(objection.title) || `Objection ${index + 1}`;
    if (!text(objection.title)) error(4, `Objection ${index + 1} needs the prospect's wording.`);
    if (!objection.rootCategory) error(4, `"${label}" needs a root category: Financial, Risk, Logistics or Relationship.`);
    if (!objection.subtype) warn(4, `"${label}" has no subtype (e.g. Affordability, Timing, Loyalty).`, "quality");
    if (text(objection.title).length > 300) error(4, `"${label}" is too long (300 characters max).`);
  });
  const objectionDupes = dupes(objections.map((objection) => objection.title));
  if (objectionDupes.length) error(4, `Objections are repeated: ${objectionDupes.slice(0, 3).join(", ")}.`);
  const sameMeaning = new Map();
  for (const objection of objections) {
    const key = `${objection.rootCategory}|${text(objection.subtype).toLowerCase()}`;
    sameMeaning.set(key, [...(sameMeaning.get(key) ?? []), objection.title]);
  }
  for (const [key, titles] of sameMeaning) {
    if (titles.length > 3 && !key.endsWith("|")) warn(4, `${titles.length} objections share ${key.replace("|", " / ")}. Spec 12 prefers fewer, well-written concerns over near-duplicates.`, "quality");
  }

  // Step 5: resources (§6.5: they must exist and have provenance)
  const resources = list(form.resources);
  const resourceName = (resource) => text(resource.name ?? resource.title);
  resources.forEach((resource, index) => {
    const label = resourceName(resource) || `Resource ${index + 1}`;
    if (!resourceName(resource)) error(5, `Resource ${index + 1} needs a name.`);
    if (!text(resource.type)) error(5, `"${label}" needs a type.`);
    if (!text(resource.content) && !resource.url && !resource.fileUrl && !text(resource.description)) warn(5, `"${label}" has no content or file yet.`, "quality");
  });
  // Email Templates / Follow Up (client's Google Doc): typed, known placeholders, and every
  // follow-up points at a template the playbook has
  const known = new Set(TEMPLATE_PLACEHOLDERS.map((item) => item.key));
  const templates = resources.filter((resource) => resource.type === "Email Template");
  templates.forEach((resource) => {
    const label = resourceName(resource) || "An email template";
    if (!TEMPLATE_PURPOSES.includes(resource.purpose)) warn(5, `"${label}" needs a template purpose (Appointment Confirmation, Requested Information …) so the right draft is offered after the call.`, "quality");
    if (!text(resource.content)) warn(5, `"${label}" has no email body, so it can't become a draft.`, "quality");
    const unknown = [...new Set([...`${resource.subject ?? ""} ${resource.content ?? ""}`.matchAll(/\{([^{}]{1,60})\}/g)].map((match) => match[1].trim()).filter((key) => !known.has(key)))];
    if (unknown.length) warn(5, `"${label}" uses placeholders PitchProX can't fill: ${unknown.slice(0, 4).map((key) => `{${key}}`).join(", ")}. Lines with them will be left out of drafts.`, "quality");
  });
  resources.filter((resource) => resource.type === "Follow Up" && resource.templatePurpose).forEach((resource) => {
    if (!templates.some((template) => template.purpose === resource.templatePurpose)) warn(5, `Follow-up "${resourceName(resource)}" uses the "${resource.templatePurpose}" email, but the playbook has no Email Template with that purpose.`, "quality");
  });

  const resourceDupes = dupes(resources.map(resourceName));
  if (resourceDupes.length) warn(5, `Resources are repeated: ${resourceDupes.slice(0, 3).join(", ")}.`, "quality");

  // Step 6: prompt delivery (min ≤ ideal ≤ max)
  const ideal = words(ai.idealLength);
  const min = words(ai.minLength);
  const max = words(ai.maxLength);
  if (min !== null && max !== null && min > max) error(6, "Prompt length: the minimum is longer than the maximum.");
  if (ideal !== null && ((min !== null && ideal < min) || (max !== null && ideal > max))) error(6, "Prompt length: the ideal length must sit between the minimum and maximum.");
  if (ai.temperature !== undefined && (Number(ai.temperature) < 0 || Number(ai.temperature) > 1)) error(6, "Creativity (temperature) must be between 0 and 1.");
  if (!text(ai.systemPrompt) && !text(ai.instructions)) warn(6, "There's no instruction set / system prompt.", "quality");

  // §9.1 contradiction checks (a reviewer must confirm the intended behavior)
  const boundaries = ai.doDontBoundaries ?? {};
  const rules = list(ai.logicRules).filter((rule) => rule.enabled !== false);
  const rulesText = blob(rules);
  const resourcesText = blob(resources);
  if (/pressure|pushy/.test(blob(boundaries.dontList)) && /challenge|push|pressure/.test(rulesText)) {
    warn(6, "A hard boundary says never pressure, but a logic rule pushes or challenges resistance.", "contradiction");
  }
  const formal = /formal/.test(blob(ai.promptVoice?.overallVoice)) || form.formality === "formal";
  if (formal && /slang|casual/.test(blob(ai.languageRules?.encourage ?? ai.languageRules))) {
    warn(6, "Prompt Voice is formal, but Language Rules encourage slang or casual phrasing.", "contradiction");
  }
  if (/permission/.test(blob(ai.closingStyle)) && /assumptive/.test(rulesText)) {
    warn(6, "Closing Style is permission-based, but a logic rule forces an assumptive close.", "contradiction");
  }
  if (/permission/.test(blob(ai.followUpStyle)) && /(automatic|repeated|every day|daily) (contact|follow)/.test(resourcesText)) {
    warn(5, "Follow-Up Style is permission-based, but a resource tells reps to follow up automatically or repeatedly.", "contradiction");
  }
  if (/clarify/.test(blob(ai.objectionTone)) && /immediate(ly)? reframe/.test(rulesText)) {
    warn(6, "Objection guidance says clarify first, but a logic rule forces an immediate reframe.", "contradiction");
  }
  if (/transparen/.test(blob(ai.trustBuildingStyle)) && /guarantee|100%|#1|number one|best in/.test(resourcesText)) {
    warn(5, "Trust style is transparency, but a resource makes claims that can't be verified (guarantee, 100%, #1).", "contradiction");
  }

  return { errors, warnings, ok: errors.length === 0 };
}

// ── Compilation (Spec 12 §5) ──
const checkedPrefs = (prefs) => list(prefs).filter((pref) => pref.checked !== false).map((pref) => pref.label ?? pref);

export function compilePlaybook(form = {}, { playbookId, version, publishedBy = null, publishedAt = null, releaseNotes = null, basedOn = null } = {}) {
  const ai = form.aiFramework ?? {};
  const boundaries = ai.doDontBoundaries ?? {};
  return {
    identity: {
      playbook_id: playbookId,
      name: text(form.playbookName),
      author: text(form.author),
      category: form.category ?? null,
      industry: form.industry ?? null,
      experience_level: form.experienceLevel ?? null,
      style: form.style ?? null,
      best_for_lead_types: list(form.leadTypes),
      description: text(form.shortDescription),
      focus_areas: list(form.focusAreas),
      key_outcomes: list(form.keyOutcomes).map((outcome) => outcome.text ?? outcome),
      internal_tags: list(form.internalTags),
      version,
      status: "published",
    },
    // Commercial metadata: never used for live strategy (§11)
    commerce: {
      runtime_use: false,
      access_type: form.accessType ?? "premium",
      price: form.accessType === "free" ? 0 : Number.parseFloat(form.price) || 0,
      distribution: form.distribution ?? "one-time",
      visibility: visibilityKey(form.visibility) ?? "marketplace",
      cover_image: form.coverImage ?? null,
      assets: list(form.assets).map(({ id, title, type, size, url }) => ({ id, title, type, size, url })),
    },
    // Internal notes stay with the playbook for staff and are kept out of the AI (§6.1)
    internal: { runtime_use: false, notes: text(form.internalNotes) },
    methodology: {
      core_coaching_philosophy: ai.coachingPhilosophy ?? null,
      selling_principles: list(form.principles).map((principle) => principle.text ?? principle),
      strategic_framing: ai.strategicFraming ?? null,
      trust_style: ai.trustBuildingStyle ?? null,
      discovery_style: ai.discoveryStyle ?? null,
      objection_tone: ai.objectionTone ?? null,
      closing_style: ai.closingStyle ?? null,
      follow_up_style: ai.followUpStyle ?? null,
    },
    voice_language: {
      tones: list(form.tones),
      communication_style: form.communicationStyle ?? null,
      sentence_style: form.sentenceStyle ?? null,
      formality: form.formality ?? null,
      energy: form.energyLevel ?? null,
      humor: form.useOfHumor ?? null,
      unique_phrases: list(form.voicePhrases),
      language_preferences: checkedPrefs(form.langPrefs),
      words_to_avoid: list(form.wordsToAvoid),
      prompt_voice: ai.promptVoice ?? null,
      language_rules: ai.languageRules ?? null,
      voice_guide_audio: form.audioFile?.url ?? null,
    },
    // Advisory sections, not a rigid workflow (§6.3)
    conversation_flow: list(form.stages).map((stage, index) => ({ order: index + 1, ...stage })),
    objection_library: list(form.objections).map(normalizeObjection).map((objection) => ({
      id: objection.id,
      phrase: text(objection.title),
      root_category: objection.rootCategory,
      subtype: objection.subtype,
      stage_relevance: objection.stages,
      lead_types: objection.leadTypes,
      preferred_response_style: objection.responseStyle ?? null,
      goal: objection.goal ?? null,
      example_response: objection.exampleResponse ?? objection.note ?? null,
    })),
    resources: list(form.resources).map(({ iconColor, ...resource }) => ({ ...resource, provenance: { added_by: resource.addedBy ?? resource.author ?? null, added_on: resource.addedDate ?? null, version: resource.version ?? 1 } })),
    prompt_framework: {
      context_inputs: ai.contextInputs ?? null,
      instruction_set: ai.instructions ?? null,
      system_prompt: ai.systemPrompt ?? null,
      response_sequence: ai.responseStructure ?? null,
      framework_settings: ai.frameworkSettings ?? null,
      triggers: list(ai.triggers).filter((trigger) => trigger.active !== false),
      generation_mode: ai.generationMode ?? null,
      creativity: ai.temperature ?? null,
      teleprompter_layout: ai.teleprompterLayout ?? null,
    },
    prompt_dna: {
      core_identity: ai.coreIdentity ?? null,
      directness: ai.dnaDirectness ?? null,
      empathy: ai.dnaEmpathy ?? null,
      urgency: ai.dnaUrgency ?? null,
      authority: ai.dnaAuthority ?? null,
      pillars: list(ai.dnaPillars),
    },
    // Methodology rules; they can't become a competing decision engine (§6.8)
    logic_rules: {
      rules: list(ai.logicRules).filter((rule) => rule.enabled !== false),
      rule_families: list(ai.rulesOverview).filter((rule) => rule.active !== false).map((rule) => rule.id ?? rule.title),
    },
    prompt_delivery: {
      ideal_length: ai.idealLength ?? null,
      min_length: ai.minLength ?? null,
      max_length: ai.maxLength ?? null,
      auto_adjust: ai.autoAdjust ?? null,
      brevity: ai.promptBrevity ?? null,
      max_word_count: ai.maxWordCount ?? null,
      words_per_minute: ai.wpmTarget ?? null,
      multi_step_sequencing: ai.multiStepSequencing ?? null,
      single_word_cues: ai.emergencySingleWordCues ?? null,
      timing_sensitivity: ai.timingSensitivity ?? null,
      prompt_cooldown: ai.promptCooldown ?? null,
    },
    // Hard boundaries are kept apart from preferences (§7)
    safety_boundaries: {
      hard_boundaries: [...list(boundaries.dontList), ...list(ai.negativeConstraints).filter((rule) => rule.enabled !== false).map((rule) => rule.text ?? rule)],
      prohibited_terms: list(ai.prohibitedTerms),
      methodology_preferences: list(boundaries.doList),
      guardrails: { compliance_disclaimers: ai.complianceDisclaimers ?? null, grounding: ai.hallucinationMode ?? null, profanity_filter: ai.profanityFilter ?? null, tone_filter: ai.toneFilter ?? null },
    },
    advanced: {
      emotion_sensitivity: ai.emotionSensitivity ?? null,
      objection_confidence: ai.objectionConfidence ?? null,
      trust_alert_threshold: ai.trustAlertThreshold ?? null,
      learning_mode: ai.enableLearningMode ?? null,
    },
    publication: { status: "published", version, published_at: publishedAt, published_by: publishedBy, release_notes: releaseNotes, based_on_version: basedOn },
  };
}

// Which builder steps differ between two forms (for release notes)
const STEP_KEYS = {
  1: ["playbookName", "author", "shortDescription", "category", "industry", "experienceLevel", "style", "leadTypes", "price", "distribution", "accessType", "focusAreas", "internalTags", "keyOutcomes", "internalNotes", "coverImage", "assets"],
  2: ["tones", "communicationStyle", "sentenceStyle", "formality", "energyLevel", "useOfHumor", "voicePhrases", "principles", "langPrefs", "wordsToAvoid", "audioFile"],
  3: ["stages"],
  4: ["objections"],
  5: ["resources"],
  6: ["aiFramework"],
  7: ["visibility"],
};
export function changedSections(before = {}, after = {}) {
  return Object.entries(STEP_KEYS)
    .filter(([, keys]) => keys.some((key) => JSON.stringify(before?.[key] ?? null) !== JSON.stringify(after?.[key] ?? null)))
    .map(([step]) => SECTIONS[step]);
}

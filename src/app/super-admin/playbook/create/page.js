"use client";

import React, { useCallback, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/client-api";
import { CATALOG } from "@/lib/playbook-catalog";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Wrench } from "lucide-react";
import CreatePlaybookHeader from "../components/create-playbook-header";
import PlaybookStepper, { PLAYBOOK_STEPS } from "../components/playbook-stepper";
import PlaybookDetailsSection from "../components/playbook-details-section";
import CoreFocusOutcomesSection from "../components/core-focus-outcomes-section";
import PlaybookPreviewCard from "../components/playbook-preview-card";
import PlaybookAssetsCard from "../components/playbook-assets-card";
import InternalAnalyticsCard from "../components/internal-analytics-card";
import DefineStyleVoiceSection from "../components/define-style-voice-section";
import LiveStylePreviewCard from "../components/live-style-preview-card";
import StyleSummaryCard from "../components/style-summary-card";
import StyleTipsCard from "../components/style-tips-card";
import BuildConversationFlowSection, { DEFAULT_STAGES } from "../components/build-conversation-flow-section";
import FlowPreviewCard from "../components/flow-preview-card";
import AiFlowExampleCard from "../components/ai-flow-example-card";
import BuildObjectionLibrarySection, { DEFAULT_OBJECTIONS } from "../components/build-objection-library-section";
import ObjectionDetailsCard from "../components/objection-details-card";
import ObjectionCoverageCard from "../components/objection-coverage-card";
import AiCoachingQualityCard from "../components/ai-coaching-quality-card";
import ResourcesScriptsSection, { DEFAULT_RESOURCES } from "../components/resources-scripts-section";
import ResourceSummaryCard from "../components/resource-summary-card";
import ResourceTipsCard from "../components/resource-tips-card";
import AiPromptFrameworkSection from "../components/ai-prompt-framework-section";
import ReviewPublishSection from "../components/review-publish-section";
import toast from "react-hot-toast";

// "short-conversational" → "Short Conversational"
const toLabel = (value) => String(value ?? "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
const joinLabels = (values) => (values ?? []).filter(Boolean).map(toLabel).join(", ");

const initialFormData = {
  // Step 1: Basic Info
  playbookName: "Herjavec Sales Method",
  // Author / Creator shown in the previews (empty = the person creating the playbook)
  author: "Robert Herjavec",
  shortDescription:
    "Real-world, no-nonsense tactics from Shark Tank's Robert Herjavec. Build trust, add value, and close bigger deals.",
  category: "sales-methodology",
  industry: "real-estate",
  experienceLevel: "intermediate-to-advanced",
  style: "direct",
  leadTypes: ["Expired", "FSBO", "Pre-Expired", "Probate", "Absentee", "Past Clients"],
  price: "49.00",
  distribution: "one-time",
  accessType: "premium",
  status: "draft",
  focusAreas: ["build-trust", "uncover-needs", "objection-handling"],
  internalTags: ["Premium", "Investor Style", "Authority Based"],
  keyOutcomes: [
    { id: 1, text: "How to build instant credibility and trust" },
    { id: 2, text: "Value-driven questioning to uncover real needs" },
    { id: 3, text: "Objection handling with confidence and clarity" },
    { id: 4, text: "Closing techniques used by top entrepreneurs and investors" },
  ],
  internalNotes:
    "This playbook uses the Herjavec framework with a trust-first approach. Focus on value, transparency and confidence.",

  // Step 2: Style & Voice
  tones: ["confident", "direct"],
  communicationStyle: "consultative",
  sentenceStyle: "short-conversational",
  formality: "professional",
  energyLevel: 95,
  useOfHumor: 25,
  voicePhrases: [
    "Here's the thing",
    "Bottom line",
    "What I've seen is...",
    "At the end of the day",
    "Let's be real",
    "Look at the data",
  ],
  principles: [
    { id: 1, text: "Build instant credibility and trust" },
    { id: 2, text: "Value-driven questioning to uncover real needs" },
    { id: 3, text: "Objection handling with confidence and clarity" },
    { id: 4, text: "Closing techniques used by top entrepreneurs and investors" },
    { id: 5, text: "Always lead with value, not pressure" },
  ],
  langPrefs: [
    { id: "clear-simple", label: "Clear and simple language", checked: true },
    { id: "no-jargon", label: "No jargon or complex terms", checked: true },
    { id: "active-voice", label: "Active voice preferred", checked: true },
    { id: "conversational", label: "Conversational and natural", checked: true },
    { id: "industry-terms", label: "Industry-specific terminology", checked: false },
  ],
  wordsToAvoid: [
    "pushy",
    "guarantee",
    "close right now",
    "cheap",
    "act now",
  ],
  audioFile: { name: "Herjavec Style Guide.mp3", size: "3.2 MB" },

  // Step 3: Conversation Flow
  stages: DEFAULT_STAGES,

  // Step 4: Objection Handling
  objections: DEFAULT_OBJECTIONS,

  // Step 5: Resources & Scripts
  resources: DEFAULT_RESOURCES,

  // Step 6: AI Prompt Framework
  aiFramework: {
    // 1. Framework Builder
    modelEngine: "neural-v4",
    generationMode: "dynamic-adaptive",
    temperature: 0.4,
    teleprompterLayout: "bullet-points",
    systemPrompt:
      "You are an elite sales execution assistant running the Herjavec Sales Method. In real-time during live sales calls, analyze the prospect's sentiment, identify objections instantly, and provide punchy, high-leverage talking points that build trust and close deals. Keep cues concise and actionable.",
    triggers: [
      { id: "silence", label: "Prospect Silence > 3s", active: true },
      { id: "objection", label: "Objection Keyword Detected", active: true },
      { id: "trust-drop", label: "Trust Score Drop > 15%", active: true },
      { id: "question", label: "Direct Question Asked", active: true },
      { id: "competitor", label: "Competitor Mentioned", active: false },
      { id: "buying-signal", label: "Buying Signal Detected", active: true },
    ],

    // 2. Playbook Prompt DNA / Variables
    coreIdentity: "high-authority-closer",
    dnaDirectness: 85,
    dnaEmpathy: 70,
    dnaUrgency: 90,
    dnaAuthority: 95,
    dnaPillars: [
      {
        id: 1,
        title: "Value Before Price",
        description:
          "Never anchor to numbers before establishing total value and ROI.",
      },
      {
        id: 2,
        title: "Diagnose Root Urgency",
        description:
          "Uncover why they are acting today vs waiting 6 months.",
      },
      {
        id: 3,
        title: "Relentless Follow-Through",
        description:
          "Every conversation must conclude with a locked-in next step.",
      },
    ],
    coachingPhilosophy: {
      mission:
        "Help agents lead high-value conversations that create clarity, confidence, and better outcomes for the client.",
      successDefinition:
        "The client feels understood, the next step is clear, and the agent advances the conversation with value.",
      aiPriorities:
        "Build trust first, bring value early, and guide toward a meaningful next step.",
      clientBelief:
        "Every client is rational, has a reason, and wants the best possible outcome.",
      agentMindset:
        "Keep the agent confident, focused, and in control of the conversation.",
      pillars: [
        "Lead with Empathy",
        "Create Clarity",
        "Deliver Value",
        "Drive Progress",
        "Maintain Control",
        "Stay Confident",
        "Be Consultative",
        "Protect the Relationship",
      ],
      selectedPillars: [
        "Lead with Empathy",
        "Create Clarity",
        "Deliver Value",
        "Drive Progress",
        "Maintain Control",
        "Stay Confident",
        "Be Consultative",
        "Protect the Relationship",
      ],
    },
    promptVoice: {
      overallVoice: "Confident, Consultative, and Premium",
      agentSpeakingStyle:
        "Speak like a seasoned advisor sitting beside the agent — clear, direct, encouraging, and focused on strategy and results.",
      tones: [
        { id: "confident", label: "Confident", icon: "check", selected: true },
        { id: "consultative", label: "Consultative", icon: "check", selected: true },
        { id: "calm", label: "Calm", icon: "droplet", selected: true },
        { id: "professional", label: "Professional", icon: "check", selected: true },
        { id: "friendly", label: "Friendly", icon: "chat", selected: false },
      ],
      writingRules: [
        "Short, punchy, and easy to read",
        "Natural, conversational language",
        "Strategic questions over statements",
        "Active and solution-focused",
        "No fluff or generic motivation",
      ],
      avoidRules: [
        "Pushy or salesy language",
        "Overly casual or slang",
        "Long explanations or monologues",
        "Fear-based or negative framing",
        "Generic cheerleading",
      ],
      examples: [
        {
          id: 1,
          quote: "Let's look at the bigger picture here.",
          tag: "Perspective",
        },
        {
          id: 2,
          quote: "What outcome are you really after?",
          tag: "Strategic",
          selected: true,
        },
        {
          id: 3,
          quote: "Good call bringing that up.",
          tag: "Empathetic",
        },
        {
          id: 4,
          quote: "Here's the move that makes sense.",
          tag: "Decisive",
        },
      ],
      customNotes:
        "This voice should always elevate the conversation and keep the agent in control.",
    },
    strategicFraming: {
      emphasis:
        "Position every conversation around strategy, value, and net outcome — not pressure or persuasion.",
      guidance:
        "Guide the agent to ask sharper questions, reframe concerns calmly, and move the conversation forward without sounding needy.",
      feelings: [
        { id: "confident", label: "Confident", icon: "sparkles", selected: true },
        { id: "consultative", label: "Consultative", icon: "users", selected: true },
        { id: "calm", label: "Calm", icon: "droplets", selected: true },
        { id: "premium", label: "Premium", icon: "shield", selected: true },
        { id: "friendly", label: "Friendly", icon: "chat", selected: false },
      ],
      wordingStyles: [
        { id: "short-statements", label: "Short statements", icon: "menu", selected: true },
        { id: "strategic-questions", label: "Strategic questions", icon: "question", selected: true },
        { id: "calm-authority", label: "Calm authority", icon: "shield", selected: true },
        { id: "story-based", label: "Story-based", icon: "book", selected: false },
        { id: "data-driven", label: "Data-driven", icon: "chart", selected: false },
        { id: "conversational", label: "Conversational", icon: "chat", selected: false },
      ],
      encourageWords: [
        "strategy",
        "net outcome",
        "maximize",
        "position",
        "unlock value",
        "long-term",
      ],
      avoidWords: [
        "I just want to help",
        "trust me",
        "best price guaranteed",
        "you have to",
        "desperate",
        "pushy",
      ],
      principles: [
        { id: "value-first", label: "Value First", icon: "shield", selected: true },
        { id: "future-pacing", label: "Future Pacing", icon: "compass", selected: true },
        { id: "contrast", label: "Contrast", icon: "scale", selected: true },
        { id: "scarcity", label: "Scarcity (Ethical)", icon: "clock", selected: true },
        { id: "loss-aversion", label: "Loss Aversion", icon: "trend", selected: true },
        { id: "authority", label: "Authority", icon: "none", selected: false },
        { id: "curiosity", label: "Curiosity", icon: "none", selected: true },
        { id: "reciprocity", label: "Reciprocity", icon: "none", selected: true },
      ],
    },
    trustBuildingStyle: {
      whatBuildsTrust:
        "Transparency, expertise, empathy, and positioning as a trusted advisor — not a salesperson.",
      howEstablishCredibility:
        "Reference experience, local knowledge, strategy, and results. Show you understand their specific situation.",
      howShowEmpathy:
        "Acknowledge their position, validate concerns, and show genuine understanding before offering insight.",
      avoidTrustDestroyers: [
        "Making it about you",
        "Overpromising",
        "Sounding pushy",
        "Generic statements",
        "Discounting their concerns",
        "Talking too much",
      ],
      trustSignals: [
        "Local expertise",
        "Market knowledge",
        "Proven process",
        "Results focus",
        "Honesty & transparency",
        "Client-first mindset",
        "Calm confidence",
      ],
      selectedSignals: [
        "Local expertise",
        "Market knowledge",
        "Proven process",
        "Results focus",
        "Honesty & transparency",
        "Client-first mindset",
        "Calm confidence",
      ],
      trustPrinciples: [
        { id: 1, text: "Serve first, sell second." },
        { id: 2, text: "Earn trust before asking for anything." },
        { id: 3, text: "Give value early and often." },
        { id: 4, text: "Make the client feel informed, not sold." },
      ],
    },
    objectionTone: {
      intent:
        "Protect trust, reduce defensiveness, and guide the conversation forward — never to argue or win.",
      emotionalResponse:
        "Calm, composed, and empathetic. Validate the concern first, then reframe with confidence and control.",
      avoidWhenResponding: [
        "Getting defensive",
        "Argue or over-explain",
        "Sounding scripted",
        "Pushing too hard",
        "Discounting their concern",
        "Pressure to decide",
      ],
      focusInstead: [
        "Validate",
        "Empathize",
        "Reframe",
        "Clarify",
        "Educate simply",
        "Offer perspective",
        "Guide next step",
        "Restore confidence",
      ],
      selectedFocus: [
        "Validate",
        "Empathize",
        "Reframe",
        "Clarify",
        "Educate simply",
        "Offer perspective",
        "Guide next step",
        "Restore confidence",
      ],
      adaptToEmotionLevel: true,
    },
    discoveryStyle: {
      goal: "Uncover the real situation, motivations, and constraints so we can position the right solution. Get them talking, not pitching.",
      questionAskingGuidance:
        "Ask fewer, better questions. One at a time. Listen. Reflect. Dig deeper based on their answers. Avoid interrogation.",
      uncoverFocus: [
        "Situation & current state",
        "Motivation & goals",
        "Challenges & frustrations",
        "Constraints & concerns",
        "Decision process",
        "Timeline",
        "Past experience",
        "Definition of success",
      ],
      selectedUncoverFocus: [
        "Situation & current state",
        "Motivation & goals",
        "Challenges & frustrations",
        "Constraints & concerns",
        "Decision process",
        "Timeline",
        "Past experience",
        "Definition of success",
      ],
      questionCharacteristics: [
        "Open-ended",
        "Curiosity-driven",
        "Situational",
        "Specific",
        "Purposeful",
        "Short & clear",
        "One at a time",
        "Follow-up based",
      ],
      selectedCharacteristics: [
        "Open-ended",
        "Curiosity-driven",
        "Situational",
        "Specific",
        "Purposeful",
        "Short & clear",
        "One at a time",
        "Follow-up based",
      ],
      exampleOpeners: [
        "Help me understand your situation a bit better...",
        "Can you walk me through what's happening now?",
        "What's most important for you to get right in this?",
      ],
      avoidList: [
        "Interrogation or rapid-fire questions",
        "Assumptions before facts",
        "Leading or biased questions",
        "Talking too much",
      ],
    },
    closingStyle: {
      philosophy:
        "Focus on mutual commitment, logical next steps, and clear decision criteria — never pushy ultimatums or fake urgency.",
      guidance:
        "Offer low-friction agreements, summarize value delivered, and lock in specific commitments with locked calendar dates.",
      techniques: [
        "Assumptive Next Step",
        "Value Summary Close",
        "Option-Balance Close",
        "Logical Consequence Close",
        "Mutual Agreement Bridge",
      ],
      selectedTechniques: [
        "Assumptive Next Step",
        "Value Summary Close",
        "Option-Balance Close",
        "Logical Consequence Close",
        "Mutual Agreement Bridge",
      ],
      avoidList: [
        "High-pressure ultimatums",
        "Fake artificial deadlines",
        "Leaving next step open-ended",
        "Desperate concessions",
      ],
      cadence: [
        {
          step: 1,
          title: "Confirm Alignment",
          description: "Ensure all core needs and value metrics are acknowledged.",
        },
        {
          step: 2,
          title: "Present Clear Options",
          description: "Give binary, high-clarity choices for the next move.",
        },
        {
          step: 3,
          title: "Lock In Details",
          description: "Establish calendar date, time, and stakeholder participants.",
        },
        {
          step: 4,
          title: "Verify Commitment",
          description: "Confirm readiness and eliminate lingering hesitations.",
        },
      ],
    },
    followUpStyle: {
      goal: "Stay top of mind, create value, and move the conversation forward consistently without being pushy or generic.",
      guidance:
        "Be timely, relevant, and personalized. Add value in every touchpoint and make it easy for the lead to respond.",
      tones: ["Professional", "Warm", "Confident", "Helpful", "Non-Pushy"],
      selectedTones: ["Professional", "Warm", "Confident", "Helpful", "Non-Pushy"],
      encouragedElements: [
        "Value or insight",
        "Reference past conversation",
        "Clear next step",
        "Easy response ask",
        "Reason to reply now",
        "Reminder of benefit",
      ],
      selectedEncouragedElements: [
        "Value or insight",
        "Reference past conversation",
        "Clear next step",
        "Easy response ask",
        "Reason to reply now",
        "Reminder of benefit",
      ],
      avoidList: [
        "Generic check-ins",
        "\"Just following up\"",
        "Overloading with info",
        "Needy or apologetic tone",
        "Asking too soon",
        "No clear purpose",
      ],
      cadence: [
        {
          step: 1,
          title: "First follow-up",
          description: "Within 24 hours of the call",
        },
        {
          step: 2,
          title: "Second follow-up",
          description: "2–3 days later (if no response)",
        },
        {
          step: 3,
          title: "Third follow-up",
          description: "5–7 days later (if no response)",
        },
        {
          step: 4,
          title: "Ongoing",
          description: "Monthly or as needed with new value",
        },
      ],
      exampleAngles: [
        "New market insight",
        "Comparable or case study",
        "Updated opportunity",
        "Answering a potential concern",
        "Reminder of mutual goal",
        "Time-sensitive opportunity",
        "Invite to short call / review",
      ],
    },
    languageRules: {
      languageType:
        "Clear, confident, and conversational. Speak like a top advisor — not a salesperson. Use simple words with high impact.",
      sentenceStructure:
        "Short to medium length. One idea per sentence. Use natural rhythm and pauses that feel like real conversation.",
      priorities: [
        "Clarity",
        "Simplicity",
        "Confidence",
        "Value-focused",
        "Client-centered",
        "Specificity",
        "Positive positioning",
        "Action-oriented",
      ],
      selectedPriorities: [
        "Clarity",
        "Simplicity",
        "Confidence",
        "Value-focused",
        "Client-centered",
        "Specificity",
        "Positive positioning",
        "Action-oriented",
      ],
      encouragedWords: [
        "For you",
        "Your situation",
        "What matters most",
        "The best move",
        "Net result",
        "Strategy",
        "Options",
        "Control",
        "Confidence",
        "Let's explore",
      ],
      selectedEncouragedWords: [
        "For you",
        "Your situation",
        "What matters most",
        "The best move",
        "Net result",
        "Strategy",
        "Options",
        "Control",
        "Confidence",
        "Let's explore",
      ],
      avoidWords: [
        "I think",
        "I feel",
        "Just",
        "Honestly",
        "Actually",
        "Basically",
        "No problem",
        "I'm just checking",
        "Salesy hype",
        "Overused filler words",
      ],
      specialInstructions: [
        {
          id: 1,
          text: "Mirror the client's energy and vocabulary without copying.",
        },
        {
          id: 2,
          text: "Avoid assumptions. Don't tell the client what they want — draw it out.",
        },
        {
          id: 3,
          text: "Never sound desperate, pushy, or overly enthusiastic.",
        },
        {
          id: 4,
          text: "Keep every prompt natural enough to say out loud without thinking.",
        },
      ],
    },
    doDontBoundaries: {
      doList: [
        "Add value first – provide insight, education, or perspective.",
        "Build trust – show empathy, listen, and validate the situation.",
        "Be clear and confident – speak with certainty, not arrogance.",
        "Ask questions – uncover needs, motivations, and constraints.",
        "Personalize – reference their situation and what matters to them.",
        "Guide next steps – move the conversation forward with value.",
        "Reinforce benefits – highlight outcomes and positive impact.",
        "Stay professional – respectful, polished, and solution-focused.",
        "Use positive language – solution-oriented and forward-looking.",
        "Keep it concise – easy to understand and actionable.",
      ],
      dontList: [
        "Make guarantees or promises about results.",
        "Discuss specific pricing, commissions, or fees.",
        "Provide legal, tax, or financial advice.",
        "Disparage competitors, agents, or brokerages.",
        "Use aggressive, manipulative, or high-pressure tactics.",
        "Argue, debate, or get emotional.",
        "Use filler words or weak language (um, like, you know).",
        "Make unethical or misleading statements.",
        "Ask for sensitive personal or private information unnecessarily.",
        "Go off-topic or derail the conversation.",
      ],
    },
    rulesOverview: [
      {
        id: "intent-detection",
        title: "Intent Detection Rule",
        subtitle: "Understand the lead's goal.",
        howItWorks:
          "Analyzes keywords, phrases, and sentence structure to identify the lead's intent.",
        active: true,
      },
      {
        id: "emotion-analysis",
        title: "Emotion Analysis Rule",
        subtitle: "Read the lead's emotional state.",
        howItWorks:
          "Detects tone, pace, and word choice to identify emotion and intensity.",
        active: true,
      },
      {
        id: "trust-logic",
        title: "Trust Scoring Rule",
        subtitle: "Measure trust in real time.",
        howItWorks:
          "Evaluates responses and engagement to calculate trust score (0-100).",
        active: true,
      },
      {
        id: "objection-logic",
        title: "Objection Detection Rule",
        subtitle: "Catch objections early.",
        howItWorks:
          "Matches phrases and intent against objection library (400+ mapped).",
        active: true,
      },
      {
        id: "response-selection",
        title: "Response Selection Rule",
        subtitle: "Choose the best prompt.",
        howItWorks:
          "Selects highest-match response based on intent + emotion + trust + objection.",
        active: true,
      },
      {
        id: "escalation-logic",
        title: "Escalation Rule",
        subtitle: "Know when to escalate.",
        howItWorks:
          "Escalates when conflict, high resistance, or trust drops below threshold.",
        active: true,
      },
      {
        id: "timing-pacing",
        title: "Timing & Pacing Rule",
        subtitle: "Control the flow.",
        howItWorks:
          "Adjusts prompt delivery speed based on silence, hesitation, and engagement.",
        active: true,
      },
      {
        id: "follow-up-logic",
        title: "Follow-Up Rule",
        subtitle: "Guide next steps.",
        howItWorks:
          "Suggests next action based on call outcome, interest level, and lead type.",
        active: true,
      },
      {
        id: "success-indicators",
        title: "Success Indicator Rule",
        subtitle: "Recognize progress.",
        howItWorks:
          "Identifies buying signals and commitment cues to move toward closing.",
        active: true,
      },
    ],

    // 3. Logic & Rules
    logicRules: [
      {
        id: 1,
        stage: "Discovery",
        condition: "Prospect mentions high price or budget constraints",
        action: "Trigger 'Value & Cost-of-Inaction' probe cue",
        priority: "High",
        enabled: true,
      },
      {
        id: 2,
        stage: "Discovery",
        condition: "Prospect mentions competitor X",
        action: "Trigger 'Differentiation & Proof Matrix' prompt",
        priority: "High",
        enabled: true,
      },
      {
        id: 3,
        stage: "Handle Objections",
        condition: "Trust score drops below 40 / 100",
        action: "Prompt empathy validation bridge before counter-pitch",
        priority: "Critical",
        enabled: true,
      },
      {
        id: 4,
        stage: "Close",
        condition: "Prospect expresses hesitation on timeline",
        action: "Trigger 'Cost of Waiting Calculation' closing prompt",
        priority: "Normal",
        enabled: true,
      },
    ],
    negativeConstraints: [
      {
        id: 1,
        text: "Never quote fixed pricing before uncovering at least 2 pain points.",
        enabled: true,
      },
      {
        id: 2,
        text: "Do not interrupt when prospect is explaining an objection or concern.",
        enabled: true,
      },
      {
        id: 3,
        text: "Do not offer discounts or concessions in Stage 1 or Stage 2.",
        enabled: true,
      },
    ],

    // 4. Prompt Length
    promptBrevity: "punchy-bullet",
    maxWordCount: 25,
    wpmTarget: 140,
    multiStepSequencing: true,
    emergencySingleWordCues: true,

    // 5. Safety & Guardrails
    prohibitedTerms: [
      "100% guaranteed return",
      "risk-free investment",
      "cheap alternative",
      "exclusive loophole",
      "instant riches",
    ],
    complianceDisclaimers: true,
    hallucinationMode: "strict-grounded",
    profanityFilter: true,
    toneFilter: true,

    // 6. Advanced
    timingSensitivity: "Balanced",
    emotionSensitivity: "Medium",
    objectionConfidence: "70%",
    trustAlertThreshold: "30 / 100",
    promptCooldown: "5 seconds",
    enableLearningMode: true,
  },
};

// Opened from the Playbook Library:
//   ?build=<draft id>  continues a saved draft
//   ?id=<playbook id>  starts the working copy of an existing platform playbook
//   (nothing)          starts a new playbook
// The draft is created on the first change and then saved automatically.
export default function SuperAdminPlaybookPage() {
  return (
    <Suspense fallback={null}>
      <PlaybookLoader />
    </Suspense>
  );
}

const BUILDS = "/api/v1/admin/playbook-builds";

// Loads the draft (or prepares a new one) before the builder renders, because the builder's
// sections copy their starting values once
function PlaybookLoader() {
  const params = useSearchParams();
  const buildId = params?.get("build");
  const playbookId = params?.get("id");
  const [loaded, setLoaded] = useState(null);
  const [failure, setFailure] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const done = (value) => !cancelled && setLoaded(value);
    if (buildId) {
      apiRequest(`${BUILDS}/${buildId}`)
        .then(({ build }) => done({ buildId: build.id, playbookId: build.playbookId, content: { ...initialFormData, ...build.content }, step: build.currentStep, revision: build.revision, savedAt: build.updatedAt }))
        .catch((error) => !cancelled && setFailure(error.message));
    } else if (playbookId) {
      // An existing playbook: reopen its draft if there is one
      apiRequest(BUILDS)
        .then(({ playbooks }) => {
          const playbook = playbooks.find((item) => item.id === playbookId);
          if (!playbook) throw new Error("That playbook doesn't exist.");
          if (playbook.draftId) return apiRequest(`${BUILDS}/${playbook.draftId}`).then(({ build }) => done({ buildId: build.id, playbookId, content: { ...initialFormData, ...build.content }, step: build.currentStep, revision: build.revision, savedAt: build.updatedAt }));
          // A playbook published from the builder: its new draft starts from the version in force
          if (playbook.activeVersionId) {
            return apiRequest(BUILDS, { method: "POST", body: { playbookId, content: {} } }).then(({ build }) => {
              window.history.replaceState(null, "", `/super-admin/playbook/create?build=${build.id}`);
              done({ buildId: build.id, playbookId, content: { ...initialFormData, ...build.content }, step: 1, revision: build.revision, savedAt: build.updatedAt });
            });
          }
          const catalog = CATALOG.find((item) => item.id === playbookId);
          done({
            buildId: null,
            playbookId,
            content: { ...initialFormData, playbookName: playbook.title, shortDescription: playbook.description ?? "", author: playbook.kind === "standard" ? "PitchProX" : playbook.subtitle ?? "", price: playbook.priceCents ? (playbook.priceCents / 100).toFixed(2) : initialFormData.price, accessType: playbook.kind === "premium" ? "premium" : catalog?.kind ?? "standard" },
            step: 1,
            revision: null,
            savedAt: null,
          });
        })
        .catch((error) => !cancelled && setFailure(error.message));
    } else {
      // Defer one tick so the state update isn't synchronous inside the effect
      Promise.resolve().then(() => done({ buildId: null, playbookId: null, content: { ...initialFormData, playbookName: "", shortDescription: "", author: "", internalNotes: "", internalTags: [] }, step: 1, revision: null, savedAt: null }));
    }
    return () => { cancelled = true; };
  }, [buildId, playbookId]);

  if (failure) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl border border-light-gray p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-dark-black">This playbook couldn&apos;t be opened.</p>
        <p className="text-xs text-medium-black">{failure}</p>
        <Link href="/super-admin/playbook" className="inline-block px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold">Back to the Playbook Library</Link>
      </div>
    );
  }
  if (!loaded) return <div className="py-24 text-center text-sm text-light-black">Loading playbook...</div>;
  return <PlaybookBuilder key={loaded.buildId ?? "new"} initial={loaded} />;
}

const AUTOSAVE_DELAY = 1500;

function PlaybookBuilder({ initial }) {
  const [currentStep, setCurrentStepState] = useState(initial.step);
  const [formData, setFormDataState] = useState(initial.content);
  const [selectedObjection, setSelectedObjection] = useState((initial.content.objections ?? DEFAULT_OBJECTIONS)[0] ?? DEFAULT_OBJECTIONS[0]);
  // Saving: changes counter → debounced save; one save at a time; the revision guards against overwriting
  const [changes, setChanges] = useState(0);
  // Who is building it: the author shown in the previews when none is entered
  const [currentUserName, setCurrentUserName] = useState("");
  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/me").then((data) => !cancelled && setCurrentUserName(data.user?.name ?? "")).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const [saveState, setSaveState] = useState(initial.buildId ? "saved" : null);
  const [savedAt, setSavedAt] = useState(initial.savedAt);
  const draft = useRef({ buildId: initial.buildId, playbookId: initial.playbookId, revision: initial.revision, saving: false, pendingAgain: false, savedChanges: 0, conflict: false, published: false });
  const latest = useRef({ formData: initial.content, currentStep: initial.step, changes: 0 });

  useEffect(() => {
    latest.current = { formData, currentStep, changes };
  });

  const markChanged = () => setChanges((count) => count + 1);
  const setFormData = (update) => {
    setFormDataState(update);
    markChanged();
  };
  const setCurrentStep = (update) => {
    setCurrentStepState(update);
    markChanged();
  };

  // force: create the draft even if nothing changed yet (Review & Publish needs one)
  const save = async ({ force = false } = {}) => {
    const state = draft.current;
    if (state.conflict || state.published) return;
    if (state.saving) {
      state.pendingAgain = true;
      return;
    }
    const { formData: content, currentStep: step, changes: upTo } = latest.current;
    if (upTo === state.savedChanges && !(force && !state.buildId)) return;
    state.saving = true;
    setSaveState("saving");
    try {
      if (!state.buildId) {
        const { build } = await apiRequest(BUILDS, { method: "POST", body: { content, currentStep: step, playbookId: state.playbookId } });
        state.buildId = build.id;
        state.revision = build.revision;
        setSavedAt(build.updatedAt);
        // Keep the address pointing at the draft without reloading the builder
        window.history.replaceState(null, "", `/super-admin/playbook/create?build=${build.id}`);
      } else {
        const { build } = await apiRequest(`${BUILDS}/${state.buildId}`, { method: "PATCH", body: { content, currentStep: step, revision: state.revision } });
        state.revision = build.revision;
        setSavedAt(build.updatedAt);
      }
      state.savedChanges = upTo;
      setSaveState(latest.current.changes === upTo ? "saved" : "unsaved");
    } catch (error) {
      if (/saved this draft after you opened it/.test(error.message)) {
        state.conflict = true;
        setSaveState("conflict");
      } else {
        setSaveState("error");
      }
      toast.error(error.message);
    } finally {
      state.saving = false;
      if (state.pendingAgain) {
        state.pendingAgain = false;
        if (!state.conflict) setTimeout(() => saveRef.current(), 0);
      }
    }
  };
  // The latest save function, for the timer and the retry above
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  // Saves anything pending and returns the draft id and revision (for checks and publishing)
  const flush = useCallback(async () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const state = draft.current;
      if (state.saving) await new Promise((resolve) => setTimeout(resolve, 100));
      else if (!state.conflict && (latest.current.changes !== state.savedChanges || !state.buildId)) await saveRef.current({ force: true });
      else break;
    }
    if (draft.current.conflict) throw new Error("Someone else saved this draft. Reload before publishing.");
    return { buildId: draft.current.buildId, revision: draft.current.revision };
  }, []);

  // Auto-save a moment after the last change
  useEffect(() => {
    if (!changes) return undefined;
    const timer = setTimeout(() => {
      // Only "unsaved" if something is still waiting (a flush may already have saved it)
      if (latest.current.changes !== draft.current.savedChanges) setSaveState((current) => (current === "conflict" || draft.current.published ? current : "unsaved"));
      saveRef.current();
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [changes]);

  // Warn before leaving with changes that haven't reached the server
  useEffect(() => {
    const warn = (event) => {
      if (latest.current.changes !== draft.current.savedChanges && !draft.current.conflict) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < PLAYBOOK_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last step: the publish card holds the checks, release notes and the Publish button
      document.getElementById("publish-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRestoreDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      tones: ["confident", "direct"],
      communicationStyle: "consultative",
      sentenceStyle: "short-conversational",
      formality: "professional",
      energyLevel: 95,
      useOfHumor: 25,
      voicePhrases: initialFormData.voicePhrases,
      principles: initialFormData.principles,
      langPrefs: initialFormData.langPrefs,
      wordsToAvoid: initialFormData.wordsToAvoid,
    }));
  };

  const handleResetStages = () => {
    setFormData((prev) => ({
      ...prev,
      stages: DEFAULT_STAGES,
    }));
  };

  // Shared by the preview cards: author (or whoever is building it) and the style tags
  const creatorName = formData.author?.trim() || currentUserName || "PitchProX";
  const previewTones = [...new Set([
    ...(formData.tones ?? []).map(toLabel),
    toLabel(formData.communicationStyle),
    toLabel(formData.formality),
    formData.energyLevel > 70 ? "High Energy" : "Balanced Energy",
    formData.useOfHumor < 30 ? "Low Humor" : "Moderate Humor",
  ].filter(Boolean))];

  const nextStepName =
    currentStep < PLAYBOOK_STEPS.length
      ? `Next: ${PLAYBOOK_STEPS[currentStep].name}`
      : "Publish Playbook";

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentStep]);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* 1. Header with Title & Action Buttons */}
      <CreatePlaybookHeader
        currentStep={currentStep}
        nextStepLabel={nextStepName}
        onSaveDraft={() => {
          if (!changes && !draft.current.buildId) {
            toast("Make a change first, then it's saved.", { icon: "ℹ️" });
            return;
          }
          markChanged();
          save().then(() => draft.current.conflict || toast.success("Draft saved."));
        }}
        onNext={handleNext}
        saveState={saveState}
        savedAt={savedAt}
        title={initial.playbookId ? `Edit Playbook: ${formData.playbookName || "Untitled"}` : "Create Internal Playbook"}
      />

      {/* 2. 7-Step Horizontal Wizard Stepper */}
      <PlaybookStepper
        currentStep={currentStep}
        onStepClick={(stepId) => setCurrentStep(stepId)}
      />

      {/* 3. Main Step Content */}
      <AnimatePresence mode="wait">
        {/* ── STEP 1: Basic Info ── */}
        {currentStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
          >
            {/* LEFT MAIN FORM COLUMN */}
            <div className="xl:col-span-8 space-y-6">
              <PlaybookDetailsSection
                formData={formData}
                onChange={handleFieldChange}
                currentUserName={currentUserName}
              />

              <CoreFocusOutcomesSection
                formData={formData}
                onChange={handleFieldChange}
              />
            </div>

            {/* RIGHT SIDEBAR COLUMN */}
            <div className="xl:col-span-4 space-y-6">
              <PlaybookPreviewCard
                avatarUrl={formData.coverImage || undefined}
                playbookName={formData.playbookName}
                creatorName={creatorName}
                description={formData.shortDescription}
                focusText={joinLabels(formData.focusAreas) || "—"}
                bestForText={joinLabels(formData.leadTypes) || "All lead types"}
                styleText={joinLabels([formData.style, ...(formData.tones ?? [])]) || "—"}
                accessType={formData.accessType}
              />

              <PlaybookAssetsCard
                assets={formData.assets ?? []}
                onAssetsChange={(assets) => handleFieldChange("assets", assets)}
              />

              <InternalAnalyticsCard
                activeUsers={0}
                totalSales={0}
                revenue="$0.00"
                conversionRate="0%"
              />
            </div>

            {/* Step navigation: Next at the bottom right */}
            <div className="xl:col-span-12 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
                >
                  <span>{nextStepName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Style & Voice ── */}
        {currentStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT MAIN FORM COLUMN */}
              <div className="xl:col-span-8 space-y-6">
                <DefineStyleVoiceSection
                  formData={formData}
                  onChange={handleFieldChange}
                  onRestoreDefaults={handleRestoreDefaults}
                />
              </div>

              {/* RIGHT SIDEBAR COLUMN */}
              <div className="xl:col-span-4 space-y-6">
                <LiveStylePreviewCard
                  playbookName={formData.playbookName}
                  creatorName={creatorName}
                  tones={previewTones}
                  avatarUrl={formData.coverImage || undefined}
                  accessType={formData.accessType}
                />

                <StyleSummaryCard
                  tone={formData.tones
                    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                    .join(", ")}
                  communicationStyle={
                    formData.communicationStyle.charAt(0).toUpperCase() +
                    formData.communicationStyle.slice(1)
                  }
                  energyLevel={
                    formData.energyLevel > 70
                      ? "High"
                      : formData.energyLevel > 30
                      ? "Medium"
                      : "Low"
                  }
                  sentenceStyle={
                    formData.sentenceStyle === "short-conversational"
                      ? "Short & Conversational"
                      : formData.sentenceStyle === "bulleted-punchy"
                      ? "Bulleted & Punchy"
                      : "Structured"
                  }
                  formality={
                    formData.formality.charAt(0).toUpperCase() +
                    formData.formality.slice(1)
                  }
                  humor={
                    formData.useOfHumor < 30
                      ? "Light"
                      : formData.useOfHumor < 70
                      ? "Moderate"
                      : "High"
                  }
                  uniqueVoiceCount={formData.voicePhrases?.length || 0}
                  corePrinciplesCount={formData.principles?.length || 0}
                />

                <StyleTipsCard />
              </div>
            </div>

            {/* Step navigation: Back, and Next at the bottom right */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back: Playbook Details</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <span>{nextStepName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Conversation Flow ── */}
        {currentStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT MAIN FORM COLUMN */}
              <div className="xl:col-span-8 space-y-6">
                <BuildConversationFlowSection
                  stages={formData.stages || DEFAULT_STAGES}
                  onChange={(updatedStages) => handleFieldChange("stages", updatedStages)}
                  onResetDefaults={handleResetStages}
                />
              </div>

              {/* RIGHT SIDEBAR COLUMN */}
              <div className="xl:col-span-4 space-y-6">
                <FlowPreviewCard
                  playbookName={formData.playbookName}
                  creatorName={creatorName}
                  tones={previewTones}
                  avatarUrl={formData.coverImage || undefined}
                  accessType={formData.accessType}
                  stages={formData.stages || DEFAULT_STAGES}
                />

                <AiFlowExampleCard />
              </div>
            </div>

            {/* Step navigation: Back, and Next at the bottom right */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back: Style & Voice</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <span>{nextStepName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Objection Handling ── */}
        {currentStep === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT MAIN FORM COLUMN */}
              <div className="xl:col-span-8 space-y-6">
                <BuildObjectionLibrarySection
                  objections={formData.objections || DEFAULT_OBJECTIONS}
                  stages={formData.stages}
                  selectedObjectionId={selectedObjection?.id}
                  onSelectObjection={(obj) => setSelectedObjection(obj)}
                  onChange={(updatedObjs) => handleFieldChange("objections", updatedObjs)}
                />
              </div>

              {/* RIGHT SIDEBAR COLUMN */}
              <div className="xl:col-span-4 space-y-6">
                <ObjectionDetailsCard
                  selectedObjection={selectedObjection || DEFAULT_OBJECTIONS[0]}
                />

                <div className="grid grid-cols-1 gap-6">
                  <ObjectionCoverageCard />
                  <AiCoachingQualityCard />
                </div>
              </div>
            </div>

            {/* Step navigation: Back, and Next at the bottom right */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back: Conversation Flow</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <span>{nextStepName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 5: Resources & Scripts ── */}
        {currentStep === 5 && (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT MAIN FORM COLUMN */}
              <div className="xl:col-span-8 space-y-6">
                <ResourcesScriptsSection
                  resources={formData.resources || DEFAULT_RESOURCES}
                  onChange={(updatedRes) => handleFieldChange("resources", updatedRes)}
                />
              </div>

              {/* RIGHT SIDEBAR COLUMN */}
              <div className="xl:col-span-4 space-y-6">
                <FlowPreviewCard
                  cardTitle="Playbook Preview"
                  showEyeIcon={false}
                  playbookName={formData.playbookName}
                  creatorName={creatorName}
                  tones={previewTones}
                  avatarUrl={formData.coverImage || undefined}
                  accessType={formData.accessType}
                  stages={formData.stages || DEFAULT_STAGES}
                />

                <ResourceSummaryCard
                  totalResources={(formData.resources || DEFAULT_RESOURCES).length}
                  totalScripts={
                    (formData.resources || DEFAULT_RESOURCES).filter(
                      (r) =>
                        r.type === "Script" ||
                        r.type === "Call Openers" ||
                        r.type === "Objection Script"
                    ).length
                  }
                  totalTemplates={
                    (formData.resources || DEFAULT_RESOURCES).filter(
                      (r) => r.type === "Email Template" || r.type === "Follow Up"
                    ).length
                  }
                  totalGuides={
                    (formData.resources || DEFAULT_RESOURCES).filter(
                      (r) => r.type === "Guide" || r.type === "Other"
                    ).length
                  }
                />

                <ResourceTipsCard />
              </div>
            </div>

            {/* Step navigation: Back, and Next at the bottom right */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back: Objection Handling</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <span>{nextStepName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 6: AI Prompt Framework ── */}
        {currentStep === 6 && (
          <motion.div
            key="step-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <AiPromptFrameworkSection
              formData={formData}
              onChange={handleFieldChange}
            />

            {/* Step navigation: Back, and Next at the bottom right */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back: Resources & Scripts</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <span>{nextStepName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 7: Review & Publish ── */}
        {currentStep === 7 && (
          <motion.div
            key="step-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <ReviewPublishSection
              formData={formData}
              onChange={handleFieldChange}
              onJumpToStep={(stepId) => setCurrentStep(stepId)}
              flush={flush}
              onPublished={() => {
                draft.current.published = true;
                setSaveState(null);
              }}
            />

            {/* Step navigation: Back, and Next at the bottom right */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-2xs cursor-pointer select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back: AI Prompt Framework</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


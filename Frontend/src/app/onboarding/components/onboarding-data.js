import {
  BadgeCheck,
  Bot,
  CircleCheck,
  FileText,
  GraduationCap,
  Hand,
  History,
  KeyRound,
  Mic,
  ShieldCheck,
  ShieldHalf,
  SquareCheckBig,
  UserMinus,
} from "lucide-react";

// Sample data for the employee onboarding flow (design only; the real
// employee record, policies and training come from the backend later).

export const STEPS = {
  welcome: { label: "Welcome", hint: "Get started", icon: Hand },
  policies: { label: "Review Policies", hint: "Company policies", icon: ShieldHalf },
  ethics: { label: "AI Ethics", hint: "Acknowledge", icon: Bot },
  security: { label: "Security Setup", hint: "Secure your account", icon: ShieldCheck },
  training: { label: "Training Modules", hint: "Complete training", icon: GraduationCap },
  final: { label: "Final Acknowledgment", hint: "Sign & agree", icon: SquareCheckBig },
  voice: { label: "Voice Calibration", hint: "Calibrate your voice", icon: Mic },
  complete: { label: "Complete", hint: "All done!", icon: CircleCheck },
};

// Sales reps calibrate their voice before going live; other staff skip that step
export const VARIANTS = {
  "sales-rep": {
    steps: ["welcome", "policies", "ethics", "security", "training", "final", "voice", "complete"],
    details: { Role: "Sales Representative", Department: "Sales", Manager: "Daniel Miller", "Start Date": "May 13, 2024" },
    dashboard: "/internal-sales-representative/dashboard",
    nextSteps: [
      { title: "Open your dashboard", text: "Explore your workspace and tools." },
      { title: "Import or create your first lead", text: "Add leads to start building momentum." },
      { title: "Start your first live call", text: "Use real-time AI guidance on every call." },
      { title: "Experience the PitchProX advantage", text: "Close more deals with confidence." },
    ],
  },
  team: {
    steps: ["welcome", "policies", "ethics", "security", "training", "final", "complete"],
    details: { Role: "Manager", Department: "Sales", Manager: "Sarah Johnson", "Start Date": "May 13, 2024" },
    dashboard: "/super-admin/dashboard",
    nextSteps: [
      { title: "Explore your Dashboard", text: "Get familiar with tools and features." },
      { title: "Review your team's activity", text: "Track performance and support your team." },
      { title: "Customize your settings", text: "Adjust notification and preferences." },
      { title: "Get the most from PitchProX", text: "Leverage insights to drive results." },
    ],
  },
};

export const DUE_DATE = "May 31, 2024";
export const EMPLOYEE_NAME = "Daniel Miller";
export const EMPLOYEE_ID = "EMP-10245";

const policyBody = (purpose) => [
  { heading: "1. Purpose", text: purpose },
  {
    heading: "2. Scope",
    text: "This policy applies to all employees, contractors, and third parties who access PitchProX systems, data, or resources. It covers all data regardless of format—electronic, paper, or vocal.",
  },
  {
    heading: "3. Policy Statement",
    text: "We are committed to maintaining the security of our systems and data through administrative, technical, and physical safeguards. Every team member is responsible for following the controls described here.",
  },
  {
    heading: "4. Responsibilities",
    text: "Managers make sure their teams complete required training and follow this policy. Employees report suspected incidents to the security team within 24 hours.",
  },
  {
    heading: "5. Compliance",
    text: "Violations may lead to disciplinary action, up to and including termination. Exceptions require written approval from the Compliance Officer.",
  },
  {
    heading: "6. Review",
    text: "This policy is reviewed every 12 months, or sooner when regulations or our services change. You will be asked to acknowledge each new version.",
  },
];

const PURPOSE =
  "The purpose of this policy is to establish guidelines for protecting the confidentiality, integrity, and availability of PitchProX information assets. This policy defines the standards and expectations for all personnel handling sensitive data.";

export const COMPANY_POLICIES = [
  { id: "infosec", title: "Information Security Policy", version: "2.4", icon: FileText, body: policyBody(PURPOSE) },
  { id: "access", title: "Access Control Policy", version: "2.4", icon: KeyRound, body: policyBody(PURPOSE) },
  { id: "acceptable", title: "Acceptable Use Policy", version: "1.8", icon: ShieldCheck, body: policyBody(PURPOSE) },
  { id: "retention", title: "Data Retention Policy", version: "1.3", icon: History, body: policyBody(PURPOSE) },
  { id: "offboarding", title: "Offboarding Policy", version: "1.1", icon: UserMinus, body: policyBody(PURPOSE) },
  { id: "password", title: "Password Policy", version: "2.0", icon: BadgeCheck, body: policyBody(PURPOSE) },
];

export const AI_POLICIES = [
  {
    id: "ai-ethics",
    title: "AI Ethics & Responsible Use",
    version: "1.2",
    icon: Bot,
    body: policyBody(
      "This policy explains how PitchProX uses AI to guide conversations, and the standards every team member follows so that AI assistance stays honest, fair and respectful of the people we call."
    ),
  },
  {
    id: "ai-disclosure",
    title: "AI Call Disclosure Policy",
    version: "1.0",
    icon: FileText,
    body: policyBody(
      "This policy sets out when and how you tell a prospect that AI guidance or call recording is in use, so that every conversation meets disclosure and consent rules."
    ),
  },
  {
    id: "recording-consent",
    title: "Call Recording Consent",
    version: "1.0",
    icon: Mic,
    body: policyBody(
      "This policy describes the consent required before a call is recorded or analysed, and how recordings are stored, accessed and deleted."
    ),
  },
];

export const TRAINING_MODULES = [
  { id: "m1", title: "Introduction to Privacy & Data Protection", minutes: 5 },
  { id: "m2", title: "Understanding Personal Data", minutes: 10 },
  { id: "m3", title: "Data Handling Best Practices", minutes: 12 },
  { id: "m4", title: "Privacy Regulations & Compliance", minutes: 10 },
  { id: "m5", title: "Final Assessment", minutes: 8 },
];

export const TRAINING_DOCUMENTS = [
  { name: "Privacy Policy Overview", size: "PDF • 1.2 MB" },
  { name: "Data Handling Guidelines", size: "PDF • 850 KB" },
  { name: "Employee Data Protection Policy", size: "PDF • 1.4 MB" },
];

export const SUPPORT_EMAIL = "support@pitchprox.com";

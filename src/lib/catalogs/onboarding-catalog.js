// Default policies and onboarding training, seeded into the database the first
// time the schema is created (INSERT IGNORE, so admin edits are never overwritten).
// Imported by lib/schema/staff.js with a relative path so the CLI scripts can use it.

const sections = (purpose) => [
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

// category "company" → Review Policies step; "ai" → AI Ethics step
export const POLICIES = [
  { id: "infosec", title: "Information Security Policy", category: "company", version: "2.4", icon: "file", body: sections(PURPOSE) },
  { id: "access-control", title: "Access Control Policy", category: "company", version: "2.4", icon: "key", body: sections(PURPOSE) },
  { id: "acceptable-use", title: "Acceptable Use Policy", category: "company", version: "1.8", icon: "shield", body: sections(PURPOSE) },
  { id: "data-retention", title: "Data Retention Policy", category: "company", version: "1.3", icon: "history", body: sections(PURPOSE) },
  { id: "offboarding", title: "Offboarding Policy", category: "company", version: "1.1", icon: "user-minus", body: sections(PURPOSE) },
  { id: "password", title: "Password Policy", category: "company", version: "2.0", icon: "badge", body: sections(PURPOSE) },
  {
    id: "ai-ethics",
    title: "AI Ethics & Responsible Use",
    category: "ai",
    version: "1.2",
    icon: "bot",
    body: sections(
      "This policy explains how PitchProX uses AI to guide conversations, and the standards every team member follows so that AI assistance stays honest, fair and respectful of the people we call."
    ),
  },
  {
    id: "ai-disclosure",
    title: "AI Call Disclosure Policy",
    category: "ai",
    version: "1.0",
    icon: "file",
    body: sections(
      "This policy sets out when and how you tell a prospect that AI guidance or call recording is in use, so that every conversation meets disclosure and consent rules."
    ),
  },
  {
    id: "recording-consent",
    title: "Call Recording Consent",
    category: "ai",
    version: "1.0",
    icon: "mic",
    body: sections("This policy describes the consent required before a call is recorded or analysed, and how recordings are stored, accessed and deleted."),
  },
];

export const ONBOARDING_COURSE = {
  id: "onboarding-privacy",
  title: "Onboarding Training",
  description:
    "Understand your responsibilities in protecting personal data and maintaining privacy. This training will help you understand how to handle and protect personal and sensitive data in accordance with company policies and global privacy regulations. You'll learn best practices for data handling, storage and sharing to reduce risk and ensure compliance.",
  category: "Privacy",
  minutes: 45,
  resources: [
    { name: "Privacy Policy Overview", size: "PDF • 1.2 MB" },
    { name: "Data Handling Guidelines", size: "PDF • 850 KB" },
    { name: "Employee Data Protection Policy", size: "PDF • 1.4 MB" },
  ],
  modules: [
    { id: "onboarding-privacy-1", title: "Introduction to Privacy & Data Protection", minutes: 5 },
    { id: "onboarding-privacy-2", title: "Understanding Personal Data", minutes: 10 },
    { id: "onboarding-privacy-3", title: "Data Handling Best Practices", minutes: 12 },
    { id: "onboarding-privacy-4", title: "Privacy Regulations & Compliance", minutes: 10 },
    { id: "onboarding-privacy-5", title: "Final Assessment", minutes: 8 },
  ],
};

// Offboarding checklist (Offboarding page and Access Records banner)
export const OFFBOARDING_STEPS = [
  { key: "disable-sso", label: "Disable SSO and MFA" },
  { key: "revoke-access", label: "Revoke application access" },
  { key: "transfer-leads", label: "Transfer leads and open calls" },
  { key: "collect-devices", label: "Collect company devices" },
  { key: "export-evidence", label: "Export audit evidence" },
  { key: "final-acknowledgment", label: "Sign final acknowledgment" },
];

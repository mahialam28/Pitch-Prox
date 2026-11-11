import LegalPage from "@/components/legal/legal-page";

export const metadata = {
  title: "Privacy Policy | PitchProX",
  description: "How PitchProX collects, uses and protects personal information.",
};

// Draft for the client's legal review (Phase 15). It describes what the app actually does.
const SECTIONS = [
  {
    id: "who-we-are",
    title: "Who we are",
    paragraphs: [
      'PitchProX ("PitchProX", "we", "us") is a real-time sales guidance platform operated by [Company legal name], [Business address]. This policy explains what personal information we collect when you use our website and app, how we use it, who we share it with, and the choices you have.',
      "If your company gave you a PitchProX account, your company decides how the account is used and is responsible for the contact data it uploads. We process that data on its behalf.",
    ],
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    bullets: [
      "Account details: your name, email address, phone number, company, role and password (stored only as a secure hash). If you sign in with Google or Facebook, we receive your name, email address and profile picture from them.",
      "Data you add: leads and prospects (names, phone numbers, email and property addresses, notes, follow-ups), playbooks, email templates, training material you upload and support tickets.",
      "Call data: when live calling is enabled, the audio of your calls, transcripts, and the AI guidance and call reports produced from them.",
      "Billing: your plan, invoices and payment status. Card details are handled by our payment provider (Stripe); we never see or store full card numbers.",
      "Usage and device data: sign-in history, IP address, browser and device type, and the pages and features you use, to keep accounts secure and improve the product.",
      "Website forms: when you ask for the \"See how it works\" video or contact us, the details you enter.",
      "Emails: whether our emails were delivered, opened or clicked, so we know they reached you and don't keep emailing addresses that bounce.",
    ],
  },
  {
    id: "how-we-use",
    title: "How we use it",
    bullets: [
      "To provide the service: run live calls, transcribe them, show live guidance on your screen, and prepare after-call reports and coaching.",
      "To run your account: sign-in and two-step login, billing, support, and service messages (for example password resets and invoices).",
      "To improve PitchProX, including making your company's playbooks and guidance more useful over time from your own calls.",
      "To send product and marketing emails you can unsubscribe from at any time (account and billing emails are always sent).",
      "To keep PitchProX safe: preventing fraud and abuse, enforcing our Terms, and meeting legal obligations.",
    ],
  },
  {
    id: "ai",
    title: "AI processing and calls",
    paragraphs: [
      "During a call, audio is sent to our speech-to-text provider and the transcript to our AI provider to produce guidance in real time. Our providers process this data on our instructions and are not allowed to use it to train their own models.",
      "Only you see the guidance; the person you call does not interact with PitchProX. You are responsible for telling the people you call about AI assistance and recording where the law requires it. PitchProX shows a disclosure notice at the start of each call to help you.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share it with",
    paragraphs: ["We do not sell personal information. We share it only with service providers that help us run PitchProX, under contracts that protect it:"],
    bullets: [
      "Hosting and database: [Hosting provider, e.g. Hostinger] (servers in [country/region]).",
      "Calling: Twilio. Speech-to-text: Deepgram. AI guidance: OpenAI and/or Anthropic.",
      "Email delivery: Postmark. Payments: Stripe.",
      "Sign-in: Google and Facebook, only if you choose to sign in with them.",
      "Professional advisers, and authorities when the law requires it or to protect rights and safety.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    paragraphs: [
      "We keep account data while your account is active. After an account is closed we delete or anonymise its data within [90] days, except billing records and security logs that we must keep for legal, tax or audit reasons (usually up to [7] years). Call recordings and transcripts are kept for [period chosen by your company / default 12 months].",
    ],
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    bullets: [
      "Access, correct or download your information from your account settings, or by contacting us.",
      "Delete your account or specific data: use the Data Deletion page (pitchprox.com/data-deletion) or email us.",
      "Unsubscribe from marketing emails with the link in any of them.",
      "Depending on where you live (for example California, the EU or the UK), you may have further rights, such as to object to or restrict processing. We will not discriminate against you for using them.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We protect data with encryption in transit (HTTPS), hashed passwords, optional two-step login, limits on repeated sign-in attempts, role-based access for our staff and an audit log of sensitive actions. No system is perfectly secure; we will tell you and the authorities about a breach where the law requires it.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    paragraphs: ["We use essential cookies to keep you signed in and secure. We do not use advertising cookies. Email open and click tracking is described above."],
  },
  {
    id: "children",
    title: "Children",
    paragraphs: ["PitchProX is a business tool and is not meant for anyone under 18. We don't knowingly collect children's information."],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: ["If we make important changes, we'll tell you by email or in the app before they take effect."],
  },
  {
    id: "contact",
    title: "Contact us",
    paragraphs: ["Questions or requests: support@pitchprox.com, or write to [Company legal name], [Business address]."],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="Draft · not yet in effect" intro="Your privacy matters to us. This policy is written to be read, so it uses plain language." sections={SECTIONS} />;
}

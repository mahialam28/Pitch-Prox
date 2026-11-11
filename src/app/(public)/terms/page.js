import LegalPage from "@/components/legal/legal-page";

export const metadata = {
  title: "Terms of Service | PitchProX",
  description: "The terms for using PitchProX.",
};

// Draft for the client's legal review (Phase 15)
const SECTIONS = [
  {
    id: "agreement",
    title: "Agreement",
    paragraphs: [
      'These Terms are an agreement between you (and the company you represent) and [Company legal name] ("PitchProX", "we"). By creating an account or using PitchProX you accept them. If you use PitchProX for a company, you confirm you may accept these Terms on its behalf.',
    ],
  },
  {
    id: "service",
    title: "The service",
    paragraphs: [
      "PitchProX gives sales professionals real-time guidance during calls: live transcription, AI-suggested responses, playbooks, calibration, after-call reports and coaching, a CRM for leads and prospects, and email tools. Features depend on your plan and may change as we improve the product.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts and security",
    bullets: [
      "Give accurate information and keep it up to date.",
      "Keep your password private, and use two-step login where you can. You're responsible for what happens under your account.",
      "Account owners decide who in their company has access and can remove them.",
      "Tell us straight away at support@pitchprox.com if you think your account has been misused.",
    ],
  },
  {
    id: "plans-billing",
    title: "Plans, trial and billing",
    bullets: [
      "The free trial includes a limited number of AI-guided calls and call reports. When it ends, choose a plan to keep calling.",
      "Paid plans renew automatically each month or year until cancelled. Prices, included calls and reports are shown on our pricing page and in your billing settings.",
      "Calls beyond your plan, extra reports and premium playbooks are charged at the prices shown when you buy them.",
      "You can cancel any time; the plan stays active until the end of the period you've paid for. Fees already paid are not refunded except where the law requires it or we agree otherwise.",
      "Payments are processed by Stripe. Taxes may be added where they apply.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Calling laws and acceptable use",
    paragraphs: ["You are responsible for how you use PitchProX to contact people. In particular, you must:"],
    bullets: [
      "Follow the laws that apply to your calls and messages, including telemarketing, do-not-call, consent and call-recording laws (for example the TCPA and the National Do Not Call Registry in the US, and state laws).",
      "Tell the people you call about AI assistance and recording where the law requires it. PitchProX shows a disclosure notice at the start of each call to help you; you remain responsible for using it correctly.",
      "Respect people's requests not to be contacted. PitchProX lets you mark a number or contact as Do not call.",
      "Not use PitchProX for harassment, deception, illegal discrimination, spam or anything unlawful, and not try to break, copy or overload the service.",
    ],
  },
  {
    id: "ai-guidance",
    title: "AI guidance",
    paragraphs: [
      "PitchProX assists your judgement; it does not replace it. AI can misunderstand words, tone or context. You decide what to say and do, and you're responsible for your conversations. We don't guarantee any particular sales result.",
    ],
  },
  {
    id: "your-data",
    title: "Your data",
    paragraphs: [
      "You own the data you add to PitchProX, such as leads, notes, playbooks and call recordings. You give us permission to host and process it to provide and improve the service for you, as described in our Privacy Policy. You confirm you have the right to upload it and to have your calls processed.",
      "When your account closes you can ask us to delete your data (see Data Deletion). We may keep records the law requires.",
    ],
  },
  {
    id: "premium-playbooks",
    title: "Premium playbooks and content",
    paragraphs: [
      "Premium playbooks, templates and other PitchProX content are licensed to you for use inside PitchProX while your account is active. You may not copy, resell or share them outside your company.",
    ],
  },
  {
    id: "third-parties",
    title: "Third-party services",
    paragraphs: [
      "PitchProX relies on providers such as Twilio, Deepgram, OpenAI/Anthropic, Postmark and Stripe, and integrates with services you connect (for example Google, Microsoft, Zoom or Zoho). Their own terms apply to your use of them, and we're not responsible for their outages.",
    ],
  },
  {
    id: "suspension",
    title: "Suspension and termination",
    paragraphs: [
      "You can close your account at any time. We may suspend or close an account that breaks these Terms or the law, puts others at risk, or doesn't pay, and we'll tell you why unless the law prevents it.",
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers and liability",
    paragraphs: [
      'PitchProX is provided "as is". To the extent the law allows, we don\'t give warranties beyond those in these Terms, and we\'re not liable for indirect or consequential losses or lost profits. Our total liability for any claim is limited to the amount you paid us in the [12] months before it.',
      "You'll defend and compensate us if a claim arises from your calls, your data or your breach of these Terms.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    paragraphs: ["We may update these Terms. We'll tell you about important changes in advance; continuing to use PitchProX afterwards means you accept them."],
  },
  {
    id: "law",
    title: "Governing law",
    paragraphs: ["These Terms are governed by the laws of [State], USA. Disputes go to the courts of [County, State], unless the law where you live says otherwise."],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: ["support@pitchprox.com · [Company legal name], [Business address]"],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updated="Draft · not yet in effect" intro="Please read these Terms before using PitchProX. They're written in plain language, but they are a binding agreement." sections={SECTIONS} />;
}

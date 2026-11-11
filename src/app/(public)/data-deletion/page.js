import LegalPage from "@/components/legal/legal-page";
import DeletionRequestForm from "./deletion-request-form";

export const metadata = {
  title: "Data Deletion | PitchProX",
  description: "How to ask PitchProX to delete your account or personal data.",
};

// Required by Facebook and Google sign-in: instructions plus a form (Phase 15, draft for legal review)
const SECTIONS = [
  {
    id: "what",
    title: "What you can ask us to delete",
    bullets: [
      "Your whole PitchProX account and the data in it (leads, prospects, notes, playbooks, emails, call recordings and transcripts).",
      "Only your call recordings and transcripts.",
      "Your contact details, if you aren't a PitchProX customer but think a customer or our team holds your information.",
      "Information we received from Facebook or Google when you signed in with them.",
    ],
  },
  {
    id: "how",
    title: "How to ask",
    bullets: [
      "Fill in the form below, or email support@pitchprox.com from the address on your account.",
      "If you signed in with Facebook, you can also remove PitchProX in Facebook → Settings & privacy → Settings → Apps and websites, then send the form so we delete what we already have.",
      "If your account belongs to your company, we may tell your company's account owner, who controls the account.",
    ],
  },
  {
    id: "next",
    title: "What happens next",
    bullets: [
      "You get an email with a reference number (DEL-####) straight away.",
      "We may reply to check that the request really comes from you.",
      "We complete requests within 30 days and email you when it's done.",
      "We keep only what the law requires, such as invoices and security logs, and delete it when that period ends.",
    ],
  },
];

export default function DataDeletionPage() {
  return (
    <LegalPage title="Data Deletion" updated="Draft · not yet in effect" intro="You can ask us to delete your PitchProX account or your personal data at any time." sections={SECTIONS}>
      <section id="request" className="mt-10 rounded-2xl border border-light-gray bg-light-gray/40 p-5 sm:p-6">
        <h2 className="text-lg font-bold">Request deletion</h2>
        <DeletionRequestForm />
      </section>
    </LegalPage>
  );
}

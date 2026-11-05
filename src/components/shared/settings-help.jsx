"use client";

import Link from "next/link";
import { LifeBuoy, Mail, MessageSquare, BookOpen } from "lucide-react";
import { usePortal } from "@/components/shared/use-portal";

const FAQ = [
  ["How do I reset my password?", "Settings → Security → Change password. If you're locked out, ask a Super Admin to send you a new invite link."],
  ["Where do I find my coaching notes?", "Coaching notes from your manager appear on your dashboard and you get an email when a new one is added."],
  ["Who can change my role or access?", "Only a Super Admin can change roles, from Compliance & Audit → Access Records."],
  ["How do I report a security concern?", "Open a ticket with the category Security, or a Super Admin can log it in Incident Management."],
];

// Settings → Need Help? (staff portals)
export default function SettingsHelp() {
  const portal = usePortal();
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-light-gray p-6 shadow-xs flex flex-col gap-1">
        <h2 className="text-lg font-bold text-dark-black flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-primary" /> Need Help?
        </h2>
        <p className="text-sm text-medium-black">Our support team is available Monday to Friday, 6 am – 6 pm PST.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`${portal.base}/mail?tab=support-tickets`} className="bg-white rounded-2xl border border-light-gray p-5 shadow-xs hover:border-primary/50 transition-colors flex flex-col gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-dark-black">Create a support ticket</span>
          <span className="text-xs text-medium-black">Describe the problem and attach screenshots. You&apos;ll see replies in Mail → Support Tickets.</span>
        </Link>
        <a href="mailto:support@pitchprox.com" className="bg-white rounded-2xl border border-light-gray p-5 shadow-xs hover:border-primary/50 transition-colors flex flex-col gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-dark-black">Email support</span>
          <span className="text-xs text-medium-black">support@pitchprox.com: we reply within one business day.</span>
        </a>
        <Link href="/onboarding" className="bg-white rounded-2xl border border-light-gray p-5 shadow-xs hover:border-primary/50 transition-colors flex flex-col gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-dark-black">Training &amp; policies</span>
          <span className="text-xs text-medium-black">Review the onboarding training and company policies.</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-light-gray p-6 shadow-xs">
        <h3 className="text-base font-bold text-dark-black mb-3">Common questions</h3>
        <div className="divide-y divide-light-gray">
          {FAQ.map(([question, answer]) => (
            <details key={question} className="py-3 group">
              <summary className="text-sm font-semibold text-dark-black cursor-pointer list-none flex justify-between gap-3">
                {question}
                <span className="text-light-black group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-medium-black mt-2">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

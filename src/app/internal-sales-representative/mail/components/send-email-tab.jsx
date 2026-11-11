"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/client-api";
import SendEmailForm from "./send-mail-form";
import QuickTemplates from "./quick-templates";
import RecentMails from "./recent-mails";
import RecentTickets from "./recent-tickets";
import NeedHelpCard from "./need-help-card";
import DraftNotice from "@/components/follow-up/draft-notice";
import { useMailDraft } from "@/components/follow-up/mail-draft";
import { useEditedDraft } from "@/app/user/settings/send-mail/mail-view";

export const SendEmailTab = ({ onSwitchToSupportTab }) => {
  // A template picked here (or via ?template= from the Templates page) refills the form
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("template");
  const [template, setTemplate] = useState(null);
  // An after-call follow-up draft (live calling → "Send an email") until another template is picked
  const draft = useMailDraft();
  // A saved draft opened from the email lists (?edit=<id>)
  const edited = useEditedDraft();
  const current = template ?? edited ?? draft;
  useEffect(() => {
    if (!templateId) return undefined;
    let cancelled = false;
    apiRequest(`/api/v1/mail/templates/${encodeURIComponent(templateId)}`)
      .then((result) => !cancelled && setTemplate(result.template))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Grid: Form (Left) & Templates + Recent Emails (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Form & Info */}
        <div className="xl:col-span-7 flex flex-col min-w-0 h-full">
          {current && current === draft && <DraftNotice draft={draft} />}
          <SendEmailForm
            key={current?.id ?? "blank"}
            initialSubject={current?.subject}
            initialMessage={current?.body}
            initialToEmail={current?.to}
            initialCc={current?.cc}
            initialBcc={current?.bcc}
            initialTrackOpens={current?.trackOpens ?? true}
            initialDraftId={current?.draftId ?? null}
          />
        </div>

        {/* Right Column: Templates & Recent Mails */}
        <div className="xl:col-span-5 flex flex-col gap-6 min-w-0">
          <QuickTemplates onSelectTemplate={setTemplate} />
          <RecentMails />
        </div>
      </div>

      {/* Bottom Grid: Recent Support Tickets & Need Help Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left: Recent Support Tickets Table */}
        <div className="xl:col-span-8 flex flex-col min-w-0">
          <RecentTickets />
        </div>

        {/* Right: Need Help Card */}
        <div className="xl:col-span-4 flex flex-col min-w-0">
          <NeedHelpCard onCreateTicket={onSwitchToSupportTab} />
        </div>
      </div>
    </div>
  );
};

export default SendEmailTab;

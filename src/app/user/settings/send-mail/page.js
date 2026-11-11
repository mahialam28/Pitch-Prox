"use client";

import React, { Suspense, useState } from "react";
import SendEmailForm from "./components/send-mail";
import QuickTemplates from "./components/templates";
import RecentMails from "./components/recent-mails";
import DraftNotice from "@/components/follow-up/draft-notice";
import { useMailDraft } from "@/components/follow-up/mail-draft";
import { useEditedDraft } from "./mail-view";

function SendMailContent() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  // An after-call follow-up draft (live calling → "Send an email") until another template is picked
  const draft = useMailDraft();
  // A saved draft opened from the email lists (?edit=<id>)
  const edited = useEditedDraft();
  const current = selectedTemplate ?? edited ?? draft;

  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
        {/* Main Column: Form */}
        <div className="w-full 2xl:col-span-7 flex flex-col">
          {current && current === draft && <DraftNotice draft={draft} />}
          <SendEmailForm key={current?.id} initialTemplate={current} />
        </div>

        {/* Side Column: Templates & Recent Mails */}
        <div className="w-full 2xl:col-span-5 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-1 gap-6">
          <QuickTemplates onSelectTemplate={setSelectedTemplate} />
          <RecentMails />
        </div>
      </div>
    </div>
  );
}

export default function SendMailPage() {
  return (
    <Suspense fallback={null}>
      <SendMailContent />
    </Suspense>
  );
}

"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { allTemplates } from "../templates/templates-data";
import SendEmailForm from "./send-mail-form";
import QuickTemplates from "./quick-templates";
import RecentMails from "./recent-mails";
import RecentTickets from "./recent-tickets";
import NeedHelpCard from "./need-help-card";

export const SendEmailTab = ({ onSwitchToSupportTab }) => {
  // A template picked here (or via ?template= from the Templates page) refills the form
  const searchParams = useSearchParams();
  const [template, setTemplate] = useState(() => allTemplates.find((item) => item.id === searchParams?.get("template")) ?? null);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Grid: Form (Left) & Templates + Recent Emails (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Form & Info */}
        <div className="xl:col-span-7 flex flex-col min-w-0 h-full">
          <SendEmailForm
            key={template?.id ?? "blank"}
            initialSubject={template?.subject}
            initialMessage={template?.body}
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

"use client";

import React, { useState } from "react";
import SendEmailForm from "./components/send-mail";
import QuickTemplates from "./components/templates";
import RecentMails from "./components/recent-mails";

export default function SendMailPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
        {/* Main Column: Form */}
        <div className="w-full 2xl:col-span-7 flex flex-col">
          <SendEmailForm key={selectedTemplate?.id} initialTemplate={selectedTemplate} />
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

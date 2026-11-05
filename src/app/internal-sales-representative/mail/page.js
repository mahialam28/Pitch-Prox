"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Wrapper from "@/components/wrappers/wrapper";
import MailHeader from "./components/mail-header";
import SendEmailTab from "./components/send-email-tab";
import SupportTicketsTab from "./components/support-tickets-tab";

function MailPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam === "support-tickets" ? "support-tickets" : "send-email"
  );
  // Follow ?tab= when it changes (adjusted during render, not in an effect)
  const [shownParam, setShownParam] = useState(tabParam);
  if (shownParam !== tabParam) {
    setShownParam(tabParam);
    if (tabParam === "support-tickets" || tabParam === "send-email") setActiveTab(tabParam);
  }

  return (
    <Wrapper variant="bottomSection" className="w-full flex flex-col gap-6">
      {/* Mail & Support Header with Tabs */}
      <MailHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab 1: Send Email View */}
      {activeTab === "send-email" && (
        <SendEmailTab onSwitchToSupportTab={() => setActiveTab("support-tickets")} />
      )}

      {/* Tab 2: Support Tickets View */}
      {activeTab === "support-tickets" && <SupportTicketsTab />}
    </Wrapper>
  );
}

export default function MailPage() {
  return (
    <Suspense fallback={null}>
      <MailPageContent />
    </Suspense>
  );
}

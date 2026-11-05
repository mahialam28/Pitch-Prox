"use client";

import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export const MailHeader = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "send-email", label: "Send Email" },
    { id: "support-tickets", label: "Support Tickets" },
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Page Title & Description */}
      <div className="w-full flex flex-col gap-1 min-w-0">
        <Title variant="small" className="!text-dark-black/90 font-bold">
          Mail & Support
        </Title>
        <Text variant="small" className="text-medium-black">
          Send emails to prospects and access support when you need it.
        </Text>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-light-gray">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer relative pb-3 ${
                isActive
                  ? "text-primary font-bold"
                  : "text-medium-black hover:text-dark-black"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MailHeader;

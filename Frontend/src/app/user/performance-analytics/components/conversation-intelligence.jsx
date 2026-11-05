"use client";

import React from "react";
import { Activity, UserPlus, Frame, Clock, Home, Info } from "lucide-react";
import Tooltip from "@/components/modals/tooltip";

const insightsData = [
  {
    id: 1,
    title: "Calls with 80-89% AI adherence convert 32% higher.",
    badge: "HIGH IMPACT",
    badgeType: "high",
    icon: Activity,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: 2,
    title: "Your trust gain is 214% above your baseline.",
    badge: "HIGH IMPACT",
    badgeType: "high",
    icon: UserPlus,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    id: 3,
    title: "Price objections are your top conversion blocker.",
    badge: "MEDIUM IMPACT",
    badgeType: "medium",
    icon: Frame,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: 4,
    title: "Your highest conversion window is 4-6 PM.",
    badge: "MEDIUM IMPACT",
    badgeType: "medium",
    icon: Clock,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    id: 5,
    title: "Pre-Expired leads generate your highest trust scores.",
    badge: "HIGH IMPACT",
    badgeType: "high",
    icon: Home,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
];

export const ConversationIntelligence = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80">
            Conversation Intelligence
          </h2>
          <Tooltip
            title="Conversation Intelligence"
            text="Displays how your conversations are performing across key communication metrics, including trust development, objection handling, conversational momentum, prompt adherence, and overall call effectiveness. Use these insights to identify patterns and continuously improve future conversations."
          >
            <Info
              tabIndex={0}
              aria-label="More about Conversation Intelligence"
              className="w-4 h-4 text-medium-black/70 shrink-0 transition-colors duration-200 hover:text-primary outline-none"
            />
          </Tooltip>
        </div>
      </div>

      {/* List of Insights */}
      <div className="space-y-4">
        {insightsData.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3.5">
              {/* Icon */}
              <div
                className={`h-9 w-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <IconComponent className="h-4 w-4" />
              </div>

              {/* Text & Badge */}
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-dark-black/80 leading-snug">
                  {item.title}
                </p>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                      item.badgeType === "high"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationIntelligence;
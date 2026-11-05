"use client";

import React from "react";
import { Plus } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export const CAMPAIGN_TABS = [
  { id: "overview", label: "Overview" },
  { id: "lifecycle-journeys", label: "Lifecycle Journeys" },
  { id: "broadcast-campaigns", label: "Broadcast Campaigns" },
  { id: "templates", label: "Templates" },
  { id: "segments", label: "Segments" },
  { id: "analytics", label: "Analytics" },
];

export default function CampaignsHeader({
  activeTab = "overview",
  onTabChange,
  onCreateJourney,
  onCreateCampaign,
  onNewTemplate,
}) {

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top Header: Title, Description & Action Buttons */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Left: Title & Subtitle */}
        <div className="flex flex-col gap-1 min-w-0">
          <Title
            variant="small"
            className="!text-dark-black font-bold text-xl sm:text-2xl font-secondary"
          >
            Email Campaigns & Journeys
          </Title>
          <Text variant="small" className="text-light-black">
            Create, manage and analyze your email marketing campaigns and automated journeys.
          </Text>
        </div>

        {/* Right: 3 Outline Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (onCreateJourney) onCreateJourney();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Journey</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onCreateCampaign) onCreateCampaign();
              else if (onTabChange) onTabChange("broadcast-campaigns");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Campaign</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNewTemplate) onNewTemplate();
              else if (onTabChange) onTabChange("templates");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="w-full border-b border-light-gray overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 sm:gap-8 min-w-max">
          {CAMPAIGN_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`pb-3 text-xs sm:text-sm font-medium transition-all duration-200 relative cursor-pointer ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-medium-black hover:text-dark-black/80"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

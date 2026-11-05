"use client";

import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export default function SettingsHeader() {
  return (
    <div className="w-full flex flex-col gap-1 min-w-0">
      <Title
        variant="small"
        className="!text-dark-black/80 font-bold text-2xl sm:text-3xl font-secondary"
      >
        Settings
      </Title>
      <Text variant="small" className="text-light-black">
        Platform configurations, API keys, organization preferences, and security settings.
      </Text>
    </div>
  );
}

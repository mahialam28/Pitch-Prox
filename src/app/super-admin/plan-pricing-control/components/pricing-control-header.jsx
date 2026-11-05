"use client";

import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export default function PricingControlHeader() {
  return (
    <div className="w-full flex flex-col gap-1 min-w-0">
      <Title
        variant="small"
        className="!text-dark-black/80 font-bold text-2xl sm:text-3xl font-secondary"
      >
        Plan & Pricing Control
      </Title>
      <Text variant="small" className="text-light-black">
        Configure subscription tiers, custom pricing packages, and call quotas.
      </Text>
    </div>
  );
}

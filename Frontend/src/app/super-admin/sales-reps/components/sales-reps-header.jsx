"use client";

import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export default function SalesRepsHeader() {
  return (
    <div className="w-full flex flex-col gap-1 min-w-0">
      <Title
        variant="small"
        className="!text-dark-black/85 font-bold text-2xl sm:text-3xl font-secondary tracking-tight"
      >
        Sales Reps
      </Title>
      <Text variant="small" className="text-light-black font-normal text-xs sm:text-sm">
        Manage and monitor your sales team performance in real time.
      </Text>
    </div>
  );
}

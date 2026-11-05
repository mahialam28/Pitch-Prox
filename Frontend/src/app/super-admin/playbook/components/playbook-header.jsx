"use client";

import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export default function PlaybookHeader() {
  return (
    <div className="w-full flex flex-col gap-1 min-w-0">
      <Title
        variant="small"
        className="!text-dark-black/80 font-bold text-2xl sm:text-3xl font-secondary"
      >
        Playbook
      </Title>
      <Text variant="small" className="text-light-black">
        Manage master scripts, objection libraries, and AI teleprompt framework templates.
      </Text>
    </div>
  );
}

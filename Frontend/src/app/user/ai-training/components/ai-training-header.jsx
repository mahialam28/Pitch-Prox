"use client";

import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export const AiTrainingHeader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* Title & Subtitle */}
      <div className="md:col-span-2 space-y-2">
        <Title variant="small" className="!text-dark-black/80">
          AI Training
        </Title>
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-emerald-500 to-purple-600 bg-clip-text text-transparent">
          Feed content into the AI to improve and refine it&apos;s performance
        </h2>
        <Text variant="small" className="leading-relaxed max-w-2xl">
          The more we learn about your business, sales methods, and past results, the
          better PitchProX AI can guide your conversations and help you close more deals.
        </Text>
      </div>

      {/* Why AI Training Matters Card */}
      <div className="bg-white rounded-2xl p-5 border border-light-gray shadow-sm space-y-2">
        <h3 className="font-bold text-dark-black/80 text-sm">
          Why AI Training Matters
        </h3>
        <Text variant="smaller" className="leading-relaxed">
          Your content helps the AI understand your voice, value, offers, process,
          objections, and winning strategies so it can prompt the right responses in real-time.
        </Text>
      </div>
    </div>
  );
};

export default AiTrainingHeader;